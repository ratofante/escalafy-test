import { NextRequest, NextResponse } from "next/server";
import { getReport, type Metric } from "@/lib/reporting";

const VALID_METRICS = new Set<Metric>([
  "meta_spend",
  "meta_impressions",
  "google_spend",
  "google_impressions",
  "revenue",
  "orders",
  "fees",
  "meta_cpm",
  "google_cpm",
  "average_order_value",
  "total_spend",
  "profit",
  "roas",
]);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const orgIdParam = searchParams.get("orgId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const metricsParam = searchParams.get("metrics");

  if (!orgIdParam || !startDate || !endDate || !metricsParam) {
    return NextResponse.json(
      { error: "Missing required query params: orgId, startDate, endDate, metrics" },
      { status: 400 }
    );
  }

  const orgId = parseInt(orgIdParam, 10);
  if (isNaN(orgId)) {
    return NextResponse.json({ error: "orgId must be a number" }, { status: 400 });
  }

  const metrics = metricsParam.split(",").map((m) => m.trim()) as Metric[];
  const invalid = metrics.filter((m) => !VALID_METRICS.has(m));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Invalid metrics: ${invalid.join(", ")}` },
      { status: 400 }
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return NextResponse.json(
      { error: "startDate and endDate must be in YYYY-MM-DD format" },
      { status: 400 }
    );
  }

  if (startDate > endDate) {
    return NextResponse.json(
      { error: "startDate must be before or equal to endDate" },
      { status: 400 }
    );
  }

  try {
    const report = await getReport({ orgId, startDate, endDate, metrics });
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
