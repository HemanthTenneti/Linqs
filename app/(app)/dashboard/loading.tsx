import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardSkeleton />
    </DashboardShell>
  );
}
