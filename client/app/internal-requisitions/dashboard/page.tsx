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
import // Select components are not used in the final render, so I'll omit them for brevity here.
// Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
"@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns"; // Import 'format' for better date rendering
import {
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Building,
  // Removed XCircle as it's not used in the StatsCard icons
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ... (CATEGORY_SERIES and fetchDashboardData function remain unchanged)
const CATEGORY_SERIES = [
  { key: "expenses", label: "Expenses", color: "#2563eb" },
  { key: "procurement", label: "Procurement", color: "#10b981" },
  { key: "refunds", label: "Refunds", color: "#f97316" },
];

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
    // ... (fetchDashboardData logic remains unchanged)
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
    return <div>Loading...</div>;
  }

  const {
    overview,
    departmentStats,
    recentRequisitions,
    // monthlyTrends is unused, categoryCount is used for chartData
    insights,
    categoryCount,
  } = metrics;

  // Transform monthly trends for the chart
  const getCategoryTotal = (label: string) =>
    categoryCount?.find(
      (entry: any) => (entry?._id || "").toLowerCase() === label.toLowerCase()
    )?.count || 0;

  const chartData = [
    CATEGORY_SERIES.reduce(
      (acc, series) => {
        acc[series.key] = getCategoryTotal(series.label);
        return acc;
      },
      { name: "Categories" } as Record<string, string | number>
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {" "}
        {/* Slightly less wide */}
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          {" "}
          {/* Added bottom border and padding */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {" "}
              {/* Heavier font weight */}
              Payment Requisition Dashboard 💰
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Overview of request metrics for selected period
            </p>
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
            icon={<FileText size={24} className="text-blue-600" />}
            description="All time requisitions"
          />
          <StatsCard
            title="Pending Approval"
            value={overview?.pending}
            icon={<Clock size={24} className="text-yellow-600" />}
            className="bg-yellow-50"
          />
          <StatsCard
            title="Approved"
            value={overview?.approved}
            icon={<CheckCircle size={24} className="text-green-600" />}
            className="bg-green-50"
          />
          <StatsCard
            title="Total Amount"
            value={formatCurrency(overview?.totalAmount)}
            icon={<DollarSign size={24} className="text-blue-600" />}
            className="bg-blue-50"
          />
        </div>
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart
            data={chartData}
            title="Category Breakdown"
            series={CATEGORY_SERIES}
          />

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
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats?.map((dept: any) => (
                    <TableRow key={dept._id}>
                      <TableCell className="font-medium">{dept._id}</TableCell>
                      <TableCell className="text-right">{dept.count}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(dept.totalAmount)}
                      </TableCell>
                      <TableCell className="text-center">
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
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequisitions?.map((req: any) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-mono text-xs">
                      {req.requisitionNumber}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {req.title}
                    </TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(req.totalAmount)}
                    </TableCell>{" "}
                    {/* Right-aligned, medium font weight */}
                    <TableCell className="text-center">
                      {" "}
                      {/* Centered */}
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
                    <TableCell className="text-right text-gray-600">
                      {" "}
                      {/* Right-aligned */}
                      {format(new Date(req.createdAt), "MMM dd, yyyy")}{" "}
                      {/* Better date format */}
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
            icon={<TrendingUp size={24} className="text-green-600" />}
            className="bg-green-50"
          />
          <StatsCard
            title="Avg. Processing Time"
            value={`${insights.avgProcessingDays} days`}
            icon={<Clock size={24} className="text-indigo-600" />}
          />
          <StatsCard
            title="Top Department"
            value={insights.topDepartment}
            icon={<Building size={24} className="text-red-600" />}
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
