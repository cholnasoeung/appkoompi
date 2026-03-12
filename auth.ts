import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import {
  environmentStatus,
  getAuthConfigurationError,
  getDatabaseConfigurationError,
} from "@/lib/env";
import User from "@/models/User";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const githubClientId = process.env.GITHUB_ID;
const githubClientSecret = process.env.GITHUB_SECRET;
export const authEnabled = environmentStatus.authSecretConfigured;
export const githubAuthEnabled = environmentStatus.githubConfigured;
export const authConfigurationError = getAuthConfigurationError();
export const databaseConfigurationError = getDatabaseConfigurationError();

let providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (databaseConfigurationError) {
        return null;
      }

      if (
        !credentials ||
        typeof credentials.email !== "string" ||
        typeof credentials.password !== "string"
      ) {
        return null;
      }

      await connectToDatabase();

      const user = await User.findOne({
        email: normalizeEmail(credentials.email),
      });

      if (!user?.passwordHash) {
        return null;
      }

      const passwordMatches = await compare(
        credentials.password,
        user.passwordHash
      );

      if (!passwordMatches) {
        return null;
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image ?? undefined,
        role: user.role,
      };
    },
  }),
];

if (githubAuthEnabled && githubClientId && githubClientSecret) {
  providers = [
    GitHubProvider({
      clientId: githubClientId,
      clientSecret: githubClientSecret,
    }),
    ...providers,
  ];
}

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (databaseConfigurationError) {
        return false;
      }

      if (account?.provider !== "github") {
        return true;
      }

      if (!user.email) {
        return false;
      }

      await connectToDatabase();

      await User.findOneAndUpdate(
        { email: normalizeEmail(user.email) },
        {
          name: user.name?.trim() || user.email.split("@")[0],
          email: normalizeEmail(user.email),
          image: user.image ?? null,
          avatar: user.image ?? null,
          githubId: account.providerAccountId,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        }
      );

      return true;
    },
    async jwt({ token, user }) {
      if (databaseConfigurationError) {
        return token;
      }

      if (user?.email) {
        await connectToDatabase();

        const dbUser = await User.findOne({
          email: normalizeEmail(user.email),
        }).lean();

        if (dbUser) {
          token.sub = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image ?? undefined;
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name;
        session.user.email = token.email ?? "";
        session.user.image =
          typeof token.picture === "string" ? token.picture : null;
        session.user.role = token.role;
      }

      return session;
    },
  },
};

export function auth() {
  if (!authEnabled) {
    return Promise.resolve(null);
  }

  return getServerSession(authOptions);
}
