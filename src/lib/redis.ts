import { Redis } from "@upstash/redis";

// Lê UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN do ambiente.
// O padrão do cliente tenta 5 vezes, com uns 4 segundos de espera no total. No redirecionamento
// é melhor desistir rápido e seguir pelo banco, então tenta só mais uma vez.
export const redis = Redis.fromEnv({
  retry: { retries: 1, backoff: () => 50 },
});
