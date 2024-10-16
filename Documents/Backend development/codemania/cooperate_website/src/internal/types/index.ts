import { createClient } from "redis";
import { Role } from "../enums";
import { Request } from "express";
import { configCache } from "@app/config/cache";

export type Constructor<T = any> = new (...args: any[]) => T;

export type RedisClient = ReturnType<typeof createClient>;

export type RedisCache = Awaited<ReturnType<typeof configCache>>;

export type Claim = { id: string; role: Role };

export type RequestWithClaims = Request & { claim: Claim };
