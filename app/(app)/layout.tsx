import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";

export const dynamic = "force-dynamic";

// ─── App Layout ───
// All routes in this group require an authenticated session.
// We guard on the server so protected pages never render for anonymous users.

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Header />

      <main className="flex-1 overflow-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
