import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { prisma } from "./prisma";

// Bootstraps the Admin table from ADMIN_EMAIL/ADMIN_PASSWORD on first login
// after this feature shipped, so existing deployments don't need a manual
// seed step. Once an Admin row exists, env vars are no longer consulted.
async function getOrBootstrapAdmin(email: string) {
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) return existing;

  const hasNoAdmins = (await prisma.admin.count()) === 0;
  if (
    hasNoAdmins &&
    email === process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD
  ) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    return prisma.admin.create({ data: { email, passwordHash } });
  }
  return null;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const admin = await getOrBootstrapAdmin(email);
        if (!admin) return null;

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) return null;

        return { id: admin.id, name: "Admin", email: admin.email };
      },
    }),
  ],
});
