import { type Metric } from "@/lib/reporting";
import { METRIC_LABELS, formatMetricValue } from "@/lib/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardsProps {
  totals: Record<string, number>;
  metrics: Metric[];
}

export default function MetricCards({ totals, metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric) => {
        const value = totals[metric] ?? 0;
        const isNegative = metric === "profit" && value < 0;
        return (
          <Card key={metric}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {METRIC_LABELS[metric]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${isNegative ? "text-destructive" : ""}`}>
                {formatMetricValue(metric, value)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
