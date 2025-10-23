"use client";
import { useEffect, useState } from "react";
import {
  getInternalRequisitions,
  updateInternalRequisitionStatus,
} from "@/app/api";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Calendar,
  Building,
  Target,
  FileText,
  DollarSign,
  Package,
  Trash,
  EyeIcon,
  Pencil,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

type InternalRequisition = {
  _id: string;
  title: string;
  department: string;
  priority: string;
  neededBy: string;
  purpose: string;
  requisitionNumber: string;
  status: string;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    category: string;
    total: number;
  }>;
  createdAt: string;
};

export default function AllInternalRequisitionPage() {
  const [internalRequisitions, setInternalRequisitions] = useState<
    InternalRequisition[]
  >([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  useEffect(() => {
    getInternalRequisitions().then((data) => setInternalRequisitions(data));
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "default";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "default";
      case "pending":
        return "secondary";
      case "rejected":
        return "destructive";
      case "in review":
        return "outline";
      default:
        return "outline";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "🔴";
      case "high":
        return "🟠";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  // Get unique values for filters
  const departments = [
    ...new Set(internalRequisitions.map((req) => req.department)),
  ];
  const priorities = [
    ...new Set(internalRequisitions.map((req) => req.priority)),
  ];
  const statuses = [...new Set(internalRequisitions.map((req) => req.status))];

  // Filter requisitions
  const filteredRequisitions = internalRequisitions.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter.length === 0 ||
      departmentFilter.includes(req.department);

    const matchesPriority =
      priorityFilter.length === 0 || priorityFilter.includes(req.priority);

    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(req.status);

    return (
      matchesSearch && matchesDepartment && matchesPriority && matchesStatus
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const toggleFilter = (
    filter: string[],
    setFilter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter([]);
    setPriorityFilter([]);
    setStatusFilter([]);
  };

  const hasFilters =
    searchTerm ||
    departmentFilter.length > 0 ||
    priorityFilter.length > 0 ||
    statusFilter.length > 0;

  // Calculate stats
  const stats = {
    total: internalRequisitions.length,
    totalAmount: internalRequisitions.reduce(
      (sum, req) => sum + req.totalAmount,
      0
    ),
    pending: internalRequisitions.filter((req) => req.status === "pending")
      .length,
    approved: internalRequisitions.filter((req) => req.status === "approved")
      .length,
  };
  async function updateStatus(id: string, status: string) {
    // prevent duplicate updates
    if (updatingId === id) return;
    setUpdatingId(id);
    try {
      const data = await updateInternalRequisitionStatus(id, status);
      // Update local state so the UI reflects the new status immediately
      setInternalRequisitions((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: data?.status ?? status } : req
        )
      );
      return data;
    } catch (error) {
      console.error("Error updating requisition status:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
            Internal Requisitions
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage and track all internal requisition requests across
            departments
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Requisitions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  {/* <DollarSign className="w-6 h-6 text-green-600" /> */}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.approved}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  All Requisitions
                </CardTitle>
                <CardDescription>
                  {filteredRequisitions.length} of {internalRequisitions.length}{" "}
                  requisitions
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search requisitions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64 border-gray-300 focus:border-blue-500"
                  />
                </div>

                {/* Department Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-gray-300"
                    >
                      <Building className="h-4 w-4" />
                      Department
                      {departmentFilter.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 bg-blue-100 text-blue-700"
                        >
                          {departmentFilter.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {departments.map((dept) => (
                      <DropdownMenuCheckboxItem
                        key={dept}
                        checked={departmentFilter.includes(dept)}
                        onCheckedChange={() =>
                          toggleFilter(
                            departmentFilter,
                            setDepartmentFilter,
                            dept
                          )
                        }
                      >
                        {dept}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Priority Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 border-gray-300"
                    >
                      <Target className="h-4 w-4" />
                      Priority
                      {priorityFilter.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 bg-orange-100 text-orange-700"
                        >
                          {priorityFilter.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {priorities.map((priority) => (
                      <DropdownMenuCheckboxItem
                        key={priority}
                        checked={priorityFilter.includes(priority)}
                        onCheckedChange={() =>
                          toggleFilter(
                            priorityFilter,
                            setPriorityFilter,
                            priority
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span>{getPriorityIcon(priority)}</span>
                          <span className="capitalize">{priority}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters */}
                {hasFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">
                    Requisition #
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Title
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Department
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Priority
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Needed By
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Requested On
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredRequisitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-32">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Search className="h-8 w-8 mb-2 text-gray-300" />
                          <p>No requisitions found</p>
                          <p className="text-sm">
                            {hasFilters
                              ? "Try adjusting your filters"
                              : "No requisitions available yet"}
                          </p>
                          {hasFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                              className="mt-2"
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequisitions.map((req, index) => (
                      <motion.tr
                        key={req._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="font-mono text-sm font-medium text-blue-600">
                          {req.requisitionNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">
                              {req.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {req.purpose}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {req.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPriorityColor(req.priority)}
                            className="capitalize"
                          >
                            {getPriorityIcon(req.priority)} {req.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusColor(req.status)}
                            className="capitalize"
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900">
                          {formatCurrency(req.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(req.neededBy)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(req.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm ">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 cursor-pointer hover:bg-blue-50"
                              aria-label={`view-${req._id}`}
                              disabled={updatingId === req._id}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(req._id, "approved")}
                              className="text-green-600 cursor-pointer hover:bg-green-50"
                              aria-label={`approve-${req._id}`}
                              disabled={!!updatingId}
                            >
                              {updatingId === req._id ? (
                                <span className="text-xs">Updating...</span>
                              ) : (
                                <ThumbsUp className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateStatus(req._id, "rejected")}
                              className="text-red-600 cursor-pointer hover:bg-red-50"
                              aria-label={`reject-${req._id}`}
                              disabled={!!updatingId}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add missing icons
const Clock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
