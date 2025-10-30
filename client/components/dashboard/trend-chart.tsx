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

interface TrendChartProps {
  data: {
    name: string;
    approved: number;
    pending: number;
    rejected: number;
    total: number;
  }[];
  title: string;
  className?: string;
}

export function TrendChart({ data, title, className }: TrendChartProps) {
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
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="approved" fill="#16a34a" name="Approved" />
              <Bar dataKey="pending" fill="#ca8a04" name="Pending" />
              <Bar dataKey="rejected" fill="#dc2626" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}