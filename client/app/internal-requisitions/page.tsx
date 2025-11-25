"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Building,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams({
        startDate: (dateRange?.from ?? new Date()).toISOString(),
        endDate: (dateRange?.to ?? new Date()).toISOString(),
      });

      const response = await fetch(
        `/api/internal-requisitions/dashboard/metrics?${params}`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const {
    overview,
    departmentStats,
    recentRequisitions,
    monthlyTrends,
    insights,
  } = metrics;

  // Transform monthly trends for the chart
  const chartData = monthlyTrends?.map((trend: any) => ({
    name: `${trend._id.month}/${trend._id.year}`,
    approved: trend.approved,
    pending: trend.pending,
    rejected: trend.rejected,
    total: trend.count,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Internal Requisitions Dashboard</h1>
            <p className="text-gray-600">Overview of request metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StatsCard
            title="Total Request"
            value={overview?.total}
            icon={<FileText size={24} />}
            description="All time requisitions"
          />
          <StatsCard
            title="Pending Approval"
            value={overview?.pending}
            icon={<Clock size={24} />}
            className="bg-yellow-50"
          />
          <StatsCard
            title="Approved"
            value={overview?.approved}
            icon={<CheckCircle size={24} />}
            className="bg-green-50"
          />
          <StatsCard
            title="Total Amount"
            value={formatCurrency(overview?.totalAmount)}
            className="bg-blue-50"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart data={chartData} title="Monthly Requests Trends" />

          {/* Department Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>
                Requests distribution by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats?.map((dept: any) => (
                    <TableRow key={dept._id}>
                      <TableCell className="font-medium">{dept._id}</TableCell>
                      <TableCell>{dept.count}</TableCell>
                      <TableCell>{formatCurrency(dept.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{dept.pending}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Requisitions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Requisitions</CardTitle>
            <CardDescription>Latest Requests submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requests#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequisitions?.map((req: any) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-mono">
                      {req.requisitionNumber}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {req.title}
                    </TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>{formatCurrency(req.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          req.status === "approved"
                            ? "default"
                            : req.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Approval Rate"
            value={`${insights.approvalRate}%`}
            icon={<TrendingUp size={24} />}
            className="bg-green-50"
          />
          <StatsCard
            title="Avg. Processing Time"
            value={`${insights.avgProcessingDays} days`}
            icon={<Clock size={24} />}
          />
          <StatsCard
            title="Top Department"
            value={insights.topDepartment}
            icon={<Building size={24} />}
          />
          <StatsCard
            title="Month/Month Growth"
            value={`${insights.monthOverMonthGrowth}%`}
            icon={<TrendingUp size={24} />}
            trend={{
              value: insights.monthOverMonthGrowth,
              isPositive: insights.monthOverMonthGrowth >= 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
