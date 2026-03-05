import sql from "@/lib/db";
import { toNum } from "@/lib/utils";

export type Metric =
  | "meta_spend"
  | "meta_impressions"
  | "google_spend"
  | "google_impressions"
  | "revenue"
  | "orders"
  | "fees"
  | "meta_cpm"
  | "google_cpm"
  | "average_order_value"
  | "total_spend"
  | "profit"
  | "roas";

export interface ReportParams {
  orgId: number;
  startDate: string;
  endDate: string;
  metrics: Metric[];
}

export interface DailyRow {
  date: string;
  [metric: string]: number | string;
}

export interface ReportResult {
  totals: Record<string, number>;
  daily: DailyRow[];
}

function computeMetrics(
  row: Record<string, unknown>,
  metrics: Metric[],
): Record<string, number> {
  const meta_spend = toNum(row.meta_spend);
  const meta_impressions = toNum(row.meta_impressions);
  const google_spend = toNum(row.google_spend);
  const google_impressions = toNum(row.google_impressions);
  const revenue = toNum(row.revenue);
  const orders = toNum(row.orders);
  const fees = toNum(row.fees);
  const total_spend = meta_spend + google_spend;

  const computed: Record<Metric, number> = {
    meta_spend,
    meta_impressions,
    google_spend,
    google_impressions,
    revenue,
    orders,
    fees,
    meta_cpm: meta_impressions > 0 ? (meta_spend / meta_impressions) * 1000 : 0,
    google_cpm:
      google_impressions > 0 ? (google_spend / google_impressions) * 1000 : 0,
    average_order_value: orders > 0 ? revenue / orders : 0,
    total_spend,
    profit: revenue - meta_spend - google_spend - fees,
    roas: total_spend > 0 ? revenue / total_spend : 0,
  };

  return Object.fromEntries(metrics.map((m) => [m, computed[m]]));
}

export async function getReport({
  orgId,
  startDate,
  endDate,
  metrics,
}: ReportParams): Promise<ReportResult> {
  const [org] = await sql`
    SELECT meta_account_id, google_account_id, store_id
    FROM organization
    WHERE id = ${orgId}
  `;

  if (!org) throw new Error(`Organization with id ${orgId} not found`);

  const rows = await sql`
    WITH
      meta AS (
        SELECT date, SUM(spend) AS meta_spend, SUM(impressions) AS meta_impressions
        FROM meta_ads_data
        WHERE account_id = ${org.meta_account_id}
          AND date BETWEEN ${startDate}::date AND ${endDate}::date
        GROUP BY date
      ),
      google AS (
        SELECT date, SUM(spend) AS google_spend, SUM(impressions) AS google_impressions
        FROM google_ads_data
        WHERE account_id = ${org.google_account_id}
          AND date BETWEEN ${startDate}::date AND ${endDate}::date
        GROUP BY date
      ),
      store AS (
        SELECT date, SUM(revenue) AS revenue, SUM(orders) AS orders, SUM(fees) AS fees
        FROM store_data
        WHERE store_id = ${org.store_id}
          AND date BETWEEN ${startDate}::date AND ${endDate}::date
        GROUP BY date
      ),
      all_dates AS (
        SELECT date FROM meta
        UNION
        SELECT date FROM google
        UNION
        SELECT date FROM store
      )
    SELECT
      d.date,
      COALESCE(m.meta_spend, 0)           AS meta_spend,
      COALESCE(m.meta_impressions, 0)     AS meta_impressions,
      COALESCE(g.google_spend, 0)         AS google_spend,
      COALESCE(g.google_impressions, 0)   AS google_impressions,
      COALESCE(s.revenue, 0)              AS revenue,
      COALESCE(s.orders, 0)               AS orders,
      COALESCE(s.fees, 0)                 AS fees
    FROM all_dates d
    LEFT JOIN meta   m ON m.date = d.date
    LEFT JOIN google g ON g.date = d.date
    LEFT JOIN store  s ON s.date = d.date
    ORDER BY d.date ASC
  `;

  const daily: DailyRow[] = rows.map((row) => ({
    date: new Date(row.date).toISOString().split("T")[0],
    ...computeMetrics(row, metrics),
  }));

  // Aggregate totals — sum raw metrics first, then re-derive calculated ones
  const aggregated: Record<string, number> = {
    meta_spend: 0,
    meta_impressions: 0,
    google_spend: 0,
    google_impressions: 0,
    revenue: 0,
    orders: 0,
    fees: 0,
  };

  for (const row of rows) {
    aggregated.meta_spend += toNum(row.meta_spend);
    aggregated.meta_impressions += toNum(row.meta_impressions);
    aggregated.google_spend += toNum(row.google_spend);
    aggregated.google_impressions += toNum(row.google_impressions);
    aggregated.revenue += toNum(row.revenue);
    aggregated.orders += toNum(row.orders);
    aggregated.fees += toNum(row.fees);
  }

  const totals = computeMetrics(aggregated, metrics);

  return { totals, daily };
}
