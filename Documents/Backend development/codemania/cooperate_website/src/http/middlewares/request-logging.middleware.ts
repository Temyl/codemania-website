import { NextFunction, Request, Response } from 'express';
import { Logger } from '@app/internal/logger';
import * as crypto from 'crypto';

/**
 * @description - Attaches a unique identifier to every request
 * @param generator function to generate id
 * @param headerName name of header to append to response
 * @param setHeader whether to add request id to header or not
 * @param tag name of attribute to keep id in request object (default: `"id"`)
 */
export function attachRequestId({
  generator = (_request: Request) => crypto.randomUUID(),
  headerName = 'x-request-id',
  setHeader = true,
  tag = 'id',
} = {}) {
  return function (req: Request, res: Response, next: NextFunction) {
    const oldValue = req.get(headerName);

    const id = oldValue === undefined ? generator(req) : oldValue;

    if (setHeader) {
      res.set(headerName, id);
    }

    req[tag] = id;

    next();
  };
}

/**
 * Captures and stores the body of the response in `Request.locals.body` whenever
 * `Response.json` is called
 * @param req express request
 * @param res express response
 * @param next nextFunction middleware function
 */
export function captureBody(req: Request, res: Response, next: NextFunction) {
  const json = res.json;

  res.json = function (body?: any) {
    res.locals.body =
      body instanceof Buffer ? JSON.parse(body.toString()) : body;
    return json.call(this, body);
  };

  next();
}

function hasUserAgent(req: Request, ignore: RegExp[]) {
  return ignore.some((x) => x.test(req.headers['user-agent']));
}

/**
 * Create middleware to log requests
 * @param logger internal logger
 * @param ignore user agents of requests to ignore
 */
export function logRequest(logger: Logger, ignore = []) {
  return function (req: Request, _res: Response, next: NextFunction) {
    // ignore some user agents
    if (hasUserAgent(req, ignore)) {
      return next();
    }

    logger.request(req);
    next();
  };
}

/**
 * Create middleware to log response
 * @param logger internal logger
 */
export function logResponse(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.on('close', () => {
      logger.response(req, res);
    });

    next();
  };
}
