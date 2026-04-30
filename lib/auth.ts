import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./db";

// ─── NextAuth v5 Configuration ───
// Uses the MongoDB adapter so sessions and accounts are persisted in our database
// rather than JWT-only. This gives us reliable user lookup from API routes
// and supports the "database" session strategy which is required for the
// MongoDB adapter to manage session records.

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [Google, GitHub, Resend],
  trustHost: true,
  session: { strategy: "database" },
  callbacks: {
    // Attach the user ID to the session object so API routes can reliably
    // identify the caller without an extra database query every time.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});
