import { redirect } from "next/navigation";

export default function CleanPage() {
  redirect("/dashboard?section=clean");
}
