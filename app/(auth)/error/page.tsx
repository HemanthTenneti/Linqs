// ─── Auth Error Page ───
// Displays authentication errors from NextAuth.
// Common errors: OAuth provider issues, email link expired, etc.

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;
  const error = errorParam ?? "Unknown error";

  // Map NextAuth error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration. Please try again later.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The sign-in link is no longer valid. It may have been used already or it may have expired.",
    Default: "An error occurred during authentication. Please try again.",
  };

  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Authentication Error</h1>
        <p className="text-text-secondary text-sm">{message}</p>
      </div>

      <a
        href="/sign-in"
        className="inline-block px-6 py-3 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors text-sm font-medium"
      >
        Try Again
      </a>
    </div>
  );
}
