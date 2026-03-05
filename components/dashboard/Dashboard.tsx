"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { type Organization } from "@/lib/organizations";
import { type Metric, type ReportResult } from "@/lib/reporting";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_METRICS } from "@/lib/metrics";
import DateRangePicker from "./DateRangePicker";
import MetricCards from "./MetricCards";
import DailyTable from "./DailyTable";

interface DashboardProps {
  org: Organization;
  initialReport: ReportResult;
  initialStartDate: string;
  initialEndDate: string;
  initialMetrics: Metric[];
}

export default function Dashboard({
  org,
  initialReport,
  initialStartDate,
  initialEndDate,
  initialMetrics,
}: DashboardProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics);
  const [report, setReport] = useState<ReportResult>(initialReport);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchReport(
    start: string,
    end: string,
    selectedMetrics: Metric[],
  ) {
    if (!selectedMetrics.length) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        orgId: String(org.id),
        startDate: start,
        endDate: end,
        metrics: selectedMetrics.join(","),
      });
      const res = await fetch(`/api/reporting?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch report");
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function toggleMetric(metric: Metric) {
    const next = metrics.includes(metric)
      ? metrics.filter((m) => m !== metric)
      : [...metrics, metric];
    setMetrics(next);
    fetchReport(startDate, endDate, next);
  }

  function handleDateChange(start: string, end: string) {
    setStartDate(start);
    setEndDate(end);
    if (start && end && start <= end) {
      fetchReport(start, end, metrics);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2 text-muted-foreground"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-1" />
              All organizations
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
              <p className="text-muted-foreground mt-1">
                Multi-channel performance report
              </p>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Updating...
              </div>
            )}
          </div>
        </header>

        {/* Date picker y toogle de metrics
        Solo hay datos para 02 febrero a 04 marzo 2026
        */}
        <Card className="mb-8">
          <CardContent className="pt-6 flex flex-wrap gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">
                Date range
              </span>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground font-medium">
                Metrics
              </span>
              <div className="flex flex-wrap gap-2">
                {ALL_METRICS.map(({ value, label }) => (
                  <Badge
                    key={value}
                    variant={metrics.includes(value) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleMetric(value)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {metrics.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              Select at least one metric to display data.
            </CardContent>
          </Card>
        ) : (
          <>
            <MetricCards totals={report.totals} metrics={metrics} />
            <DailyTable daily={report.daily} metrics={metrics} />
          </>
        )}
      </div>
    </main>
  );
}
