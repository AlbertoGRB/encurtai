import { Redis } from "@upstash/redis";

// Lê UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN do ambiente.
export const redis = Redis.fromEnv();
