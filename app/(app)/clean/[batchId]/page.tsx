import { redirect } from "next/navigation";

export default function BatchResultsPage() {
  redirect("/dashboard?section=clean");
}
