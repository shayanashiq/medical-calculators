import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail || email !== adminEmail) {
          return null;
        }

        // const hash = process.env.ADMIN_PASSWORD_HASH;
        // if (hash) {
        //   const ok = await bcrypt.compare(password, hash);
        //   if (!ok) {
        //     return null;
        //   }
        // } else if (process.env.ADMIN_PASSWORD) {
          if (password !== process.env.ADMIN_PASSWORD) {
            return null;
          }
        // } else {
        //   return null;
        // }

        return { id: "admin", email, name: "Admin" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
});
