// ─── Auth Layout ───
// Centered card layout for sign-in and error pages.
// Keeps auth pages visually distinct from the main app layout.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[440px] sketch-frame p-8 sm:p-10 rotate-[-0.5deg]">
        {children}
      </div>
    </div>
  );
}
