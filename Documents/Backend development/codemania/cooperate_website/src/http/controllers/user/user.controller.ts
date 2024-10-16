import {
  controller,
  httpPatch,
  httpPost,
  request,
  response,
  requestBody,
} from 'inversify-express-utils';
import { inject } from 'inversify';
import { UserService } from '@app/services/user/user.service';
import {
  BROKER_TOKENS,
  MIDDLEWARE_TOKENS,
  MODULE_TOKENS,
  SERVICE_TOKENS,
} from '@app/ioc/tokens';
import { Request, Response } from 'express';
import { Cache } from 'cache-manager';
import { validationPipe } from '@app/http/middlewares/validation.middleware';
import { EmailDto } from '@app/http/dto/email.dto';

import { Otp } from '@app/modules/otp';
import { ApplicationError } from '@app/internal/errors';
import { StatusCodes } from 'http-status-codes';

import {
  SuccessResponseDto,
} from '@app/http/dto/http-response.dto';
import { AppEnv, DURATION } from '@app/internal/enums';
import { jsonParseFromCache } from '@app/utils/json-parse-from-cache';
import { SignUpDto } from './dtos/signup.dto';
import { hashPassword, verifyPassword } from '@app/utils/bcrypt-utils';
import { loginDto } from './dtos/login.dto';
import { TokenAuth } from '@app/modules/token-auth';
import { genOtpIdxKey, OtpFlow } from '@app/utils/otp-flow';
import { Env } from '@app/internal/env';
import { VerifyOtpDto } from './dtos/forgot-passcode.dto';
import { SendChamp } from '@app/modules/sendchamp';
import { resetPasscodeDto } from './dtos/reset-passcode.dto';


@controller('/admin')
export class UserController {
  constructor(
    @inject(MODULE_TOKENS.AppCache) private readonly appCache: Cache,
    @inject(MODULE_TOKENS.TokenAuth)
    private readonly tokenAuth: TokenAuth,
    @inject(MODULE_TOKENS.Otp)
    private readonly otp: Otp,
    @inject(MODULE_TOKENS.Env)
    private readonly env: Env,
    @inject(SERVICE_TOKENS.UserService)
    private readonly userService: UserService,
    @inject(BROKER_TOKENS.SendChamp)
    private readonly sendChamp: SendChamp,
  ) {}

  @httpPost(
    '/signup',
    validationPipe(SignUpDto)
  )
  public async SignUp(
    @requestBody() payload: SignUpDto,
    @request() req: Request,
    @response() res: Response,
  ) {

    var hashPasscode : string;

    if (payload.passcode != null) {
      hashPasscode = await hashPassword(payload.passcode);
    }

    await this.userService.create({
      full_name: payload.full_name,
      email: payload.email,
      passcode: hashPasscode,
    });

    return new SuccessResponseDto();

  }

  @httpPost('/login', 
    validationPipe(loginDto)
  )
  public async Login(
    @requestBody() payload: loginDto,
    @response() res: Response 
  ) {
    const user = await this.userService.getByEmail(payload.email);

    const confirmPasscode = await verifyPassword(payload.passcode, user.passcode);

    if (!confirmPasscode) {
      throw new ApplicationError
      (StatusCodes.BAD_REQUEST,
        'incorrect passcode!'
      );
    }

    const auth_token = await this.tokenAuth.generate(
      {
        id: user.id, tokenType: 'access'
      },
      2 * DURATION.DAYS,
    )

    return new SuccessResponseDto({ data: { auth_token }});
  }

  @httpPost('/forgot-passcode',
    validationPipe(EmailDto)
)
public async forgotPasscode(
    @requestBody() payload: EmailDto,
    @response() res: Response,
) {
   
    if (!payload.email) {
        throw new ApplicationError(
            StatusCodes.BAD_REQUEST,
            'Email is required',
        );
    }

    
    const user = await this.userService.getByEmail(payload.email);
    if (!user) {
        throw new ApplicationError(
            StatusCodes.NOT_FOUND,
            'No account found with this email address',
        );
    }

    
    const otp = await this.otp.generate({
        key: user.id,
        length: 6,
        expiresIn: 2 * DURATION.MINUTES,
    });

    const flow_key = await genOtpIdxKey(OtpFlow.RESET_PASSWORD, otp);
    const metadata = {
        id: user.id,
        email: payload.email,
    };

    await this.appCache.set(
        flow_key,
        JSON.stringify({ ...metadata, flow: OtpFlow.RESET_PASSWORD }),
        10 * DURATION.MINUTES,
    );

    const sendOtp = {
        to: [{ email: payload.email }],
        from: { email: `${this.env.get('SENDER_EMAIL')}` },
        subject: 'RESET PASSWORD',
        message_body: {
            type: 'html',
            value: `
            <h1>Password Reset</h1>
            <p>Use the following OTP to reset your password:</p>
            <h2>${otp}</h2>
            <p>This OTP will expire in 2 minutes.</p>
          `
        }
    };

    try {
        await this.sendChamp.sendEmail(sendOtp);
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        throw new ApplicationError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            'Failed to send OTP email. Please try again.',
        );
    }

    
    if (this.env.get<AppEnv>('NODE_ENV') !== AppEnv.PRODUCTION) {
        res.setHeader('preview-otp', otp);
    }

    return new SuccessResponseDto({ data: { flow_key } });
}



  @httpPatch(
    '/forgot-passcode',
    MIDDLEWARE_TOKENS.AuthMiddleware,
    validationPipe(VerifyOtpDto),
  )
  public async verifyOtp(
    @request() req: Request,
    @requestBody() payload: VerifyOtpDto,
  ) {
    const metadata = await this.appCache
      .get<string>(payload.flow_key)
      .then(jsonParseFromCache);

    if (metadata == null) {
      throw new ApplicationError
      (StatusCodes.BAD_REQUEST,
        'input Otp'
      );
    }
    
    const isOtpValid = await this.otp.verify(metadata.id, payload.otp);

    if (!isOtpValid) {
      throw new ApplicationError
      (StatusCodes.BAD_REQUEST,
        'invalid Otp'
      );
    }

    const auth_token = await this.tokenAuth.generate(
      {id: metadata.id, tokenType: 'access'},
      10 * DURATION.MINUTES,
    );

    const flow_key = await genOtpIdxKey(OtpFlow.RESET_PASSWORD, payload.otp)


    return new SuccessResponseDto({ data: { auth_token, flow_key }});
  }

  @httpPost('/reset-passcode', MIDDLEWARE_TOKENS.AuthMiddleware)
  public async updateTransactionPin(
    @request() req: Request,
    @requestBody() payload: resetPasscodeDto,
  ) {
    const claim = <Record<string, any>>(req as any).claim;
    const metadata = await this.appCache
    .get<string>(payload.flow_key)
    .then(jsonParseFromCache);

    if (metadata.id !== claim.id) {
      throw new ApplicationError(
        StatusCodes.BAD_REQUEST,
        'invalid flow_key provided',
      )
    }

    const newPasscodeHash = await hashPassword(payload.new_passcode);

    await this.userService.update(claim.id, {passcode: newPasscodeHash});

    return new SuccessResponseDto();
  }



}  


  
