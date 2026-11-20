import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "@/lib/db";

// Com o adaptador, a sessão fica no banco e o cookie guarda só um token aleatório.
// Sair apaga a sessão de verdade. O GitHub lê AUTH_GITHUB_ID e AUTH_GITHUB_SECRET do ambiente.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [GitHub],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Devolve só o que as telas usam. Sem isso, o token da sessão
    // e o resto do registro do banco iriam junto para o navegador.
    session({ session, user }) {
      return {
        expires: session.expires,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      };
    },
  },
});
