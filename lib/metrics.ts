import { type Metric } from "@/lib/reporting";

export const METRIC_LABELS: Record<Metric, string> = {
  revenue: "Revenue",
  orders: "Orders",
  fees: "Fees",
  average_order_value: "Avg Order Value",
  meta_spend: "Meta Spend",
  meta_impressions: "Meta Impressions",
  meta_cpm: "Meta CPM",
  google_spend: "Google Spend",
  google_impressions: "Google Impressions",
  google_cpm: "Google CPM",
  total_spend: "Total Spend",
  profit: "Profit",
  roas: "ROAS",
};

export const ALL_METRICS = (
  Object.entries(METRIC_LABELS) as [Metric, string][]
).map(([value, label]) => ({ value, label }));

const CURRENCY_METRICS = new Set<Metric>([
  "revenue",
  "fees",
  "average_order_value",
  "meta_spend",
  "google_spend",
  "total_spend",
  "profit",
  "meta_cpm",
  "google_cpm",
]);

const INTEGER_METRICS = new Set<Metric>([
  "orders",
  "meta_impressions",
  "google_impressions",
]);

export function formatMetricValue(metric: Metric, value: number): string {
  if (metric === "roas") return `${value.toFixed(2)}x`;
  if (INTEGER_METRICS.has(metric)) return value.toLocaleString();
  if (CURRENCY_METRICS.has(metric))
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  return value.toFixed(2);
}
