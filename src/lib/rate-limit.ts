import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// RN07: cada usuário cria no máximo 20 links por hora (janela deslizante).
export const LINKS_PER_HOUR = 20;

export const createLinkRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(LINKS_PER_HOUR, "1 h"),
  prefix: "ratelimit:create-link",
});
