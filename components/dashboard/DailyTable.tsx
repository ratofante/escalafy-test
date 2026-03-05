import { type Metric, type DailyRow } from "@/lib/reporting";
import { METRIC_LABELS, formatMetricValue } from "@/lib/metrics";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface DailyTableProps {
  daily: DailyRow[];
  metrics: Metric[];
}

export default function DailyTable({ daily, metrics }: DailyTableProps) {
  if (daily.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground text-sm">
          No data available for the selected date range.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {metrics.map((metric) => (
                <TableHead key={metric} className="text-right whitespace-nowrap">
                  {METRIC_LABELS[metric]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {daily.map((row) => (
              <TableRow key={row.date}>
                <TableCell className="font-medium tabular-nums">{row.date}</TableCell>
                {metrics.map((metric) => {
                  const value = (row[metric] as number) ?? 0;
                  const isNegative = metric === "profit" && value < 0;
                  return (
                    <TableCell
                      key={metric}
                      className={`text-right tabular-nums ${isNegative ? "text-destructive" : ""}`}
                    >
                      {formatMetricValue(metric, value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
