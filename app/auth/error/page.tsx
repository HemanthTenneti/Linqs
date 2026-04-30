import { redirect } from "next/navigation";

// NextAuth is configured to use /auth/error.
// Our auth error UI lives at /error, so this keeps both URLs working.
export default function AuthErrorBridge() {
  redirect("/error");
}
