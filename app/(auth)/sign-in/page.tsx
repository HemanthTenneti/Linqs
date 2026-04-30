import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInClient } from "./SignInClient";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return <SignInClient />;
}
