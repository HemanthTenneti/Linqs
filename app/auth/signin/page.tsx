import { redirect } from "next/navigation";

// NextAuth is configured to use /auth/signin.
// Our main auth UI lives at /sign-in, so this route is a compatibility bridge.
export default function AuthSigninBridge() {
  redirect("/sign-in");
}
