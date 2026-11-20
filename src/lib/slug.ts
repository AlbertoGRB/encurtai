import { customAlphabet } from "nanoid";
import { z } from "zod";

// Sem 0, o, 1 e l, que se confundem quando alguém lê ou digita o link.
const RANDOM_SLUG_ALPHABET = "23456789abcdefghijkmnpqrstuvwxyz";
const RANDOM_SLUG_LENGTH = 7;

export const generateSlug = customAlphabet(
  RANDOM_SLUG_ALPHABET,
  RANDOM_SLUG_LENGTH,
);

// Caminhos do próprio app: um link com um desses apelidos nunca seria alcançado.
const RESERVED_SLUGS = new Set([
  "api",
  "dashboard",
  "login",
  "logout",
  "auth",
  "admin",
  "static",
]);

export const customSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, {
    error: "O apelido precisa ter pelo menos 3 caracteres.",
    abort: true,
  })
  .max(30, {
    error: "O apelido pode ter no máximo 30 caracteres.",
    abort: true,
  })
  .regex(/^[a-z0-9-]+$/, {
    error: "Use só letras minúsculas, números e hífen.",
    abort: true,
  })
  .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
    error: "O apelido não pode começar nem terminar com hífen.",
    abort: true,
  })
  .refine((slug) => !RESERVED_SLUGS.has(slug), {
    error: "Apelido indisponível.",
  });
