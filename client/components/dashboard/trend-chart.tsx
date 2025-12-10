import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

interface TrendChartProps {
  data: Record<string, string | number>[];
  title: string;
  className?: string;
  series?: ChartSeries[];
  xKey?: string;
}

const DEFAULT_SERIES: ChartSeries[] = [
  { key: "approved", label: "Approved", color: "#16a34a" },
  { key: "pending", label: "Pending", color: "#ca8a04" },
  { key: "rejected", label: "Rejected", color: "#dc2626" },
];

export function TrendChart({
  data,
  title,
  className,
  series = DEFAULT_SERIES,
  xKey = "name",
}: TrendChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {series.map((entry) => (
                <Bar
                  key={entry.key}
                  dataKey={entry.key}
                  fill={entry.color}
                  name={entry.label}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}