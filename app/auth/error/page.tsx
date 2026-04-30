import { redirect } from "next/navigation";

// NextAuth is configured to use /auth/error.
// Our auth error UI lives at /error, so this keeps both URLs working.
export default async function AuthErrorBridge({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  if (error) {
    redirect(`/error?error=${encodeURIComponent(error)}`);
  }

  redirect("/error");
}
