import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/utils/password";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      username: string;
      userId: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    name?: string | null;
    username: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Find user by username
        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user) {
          return null; // Return null instead of throwing an error
        }

        // Verify password
        const isValid = verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null; // Return null instead of throwing an error
        }

        // Return user object without password
        return {
          id: user.id.toString(), // Ensure ID is a string
          username: user.username,
        }; // Cast to User type
      },
    }),
  ],
  pages: {
    signIn: "/login", // Customize this to your login page path
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.username = token.username as string;
        session.user.userId = token.userId as string;
      }
      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
  trustHost: true,
});
