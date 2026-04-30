import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// NextAuth is configured to use /auth/signin.
// Our main auth UI lives at /sign-in, so this route is a compatibility bridge.
export default async function AuthSigninBridge() {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}
