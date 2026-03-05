import { notFound } from "next/navigation";
import { getReport, type Metric } from "@/lib/reporting";
import { getOrganizations } from "@/lib/organizations";
import Dashboard from "@/components/dashboard/Dashboard";

const DEFAULT_METRICS: Metric[] = [
  "revenue",
  "total_spend",
  "profit",
  "roas",
  "meta_spend",
  "google_spend",
];

const fmt = (d: Date) => d.toISOString().split("T")[0];

const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

const DEFAULT_START = fmt(thirtyDaysAgo);
const DEFAULT_END = fmt(today);

interface PageProps {
  params: Promise<{ orgId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { orgId: orgIdParam } = await params;
  const orgId = parseInt(orgIdParam, 10);

  if (isNaN(orgId)) notFound();

  const orgs = await getOrganizations();
  const org = orgs.find((o) => o.id === orgId);

  if (!org) notFound();

  const initialReport = await getReport({
    orgId,
    startDate: DEFAULT_START,
    endDate: DEFAULT_END,
    metrics: DEFAULT_METRICS,
  });

  return (
    <Dashboard
      org={org}
      initialReport={initialReport}
      initialStartDate={DEFAULT_START}
      initialEndDate={DEFAULT_END}
      initialMetrics={DEFAULT_METRICS}
    />
  );
}
