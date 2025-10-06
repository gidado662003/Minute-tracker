"use client";
import React, { useState, useEffect } from "react";
import { getAllActionItems, updateActionItemStatus } from "../api";
import {
  Table,
  TableBody,
  
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

type ActionItem = {
  _id: string;
  desc: string;
  owner?: string;
  due?: string | Date | null;
  status?: string;
  meetingId: string;
  meetingDate?: string | Date | null;
};

function ActionItemsPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [meetingDateFilter, setMeetingDateFilter] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<ActionItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [refreshToggle, setRefreshToggle] = useState<boolean>(false);

  const formatDate = (dateString?: string | Date | null): string => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    async function fetchActionItems() {
      try {
        const data = await getAllActionItems();
        setActionItems(data as ActionItem[]);
      } catch (err) {
        setError("Failed to fetch action items");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchActionItems();
  }, [refreshToggle]);

  const statusOptions = [
    ...new Set(actionItems.map((item) => item.status)),
  ].filter(Boolean) as string[];

  const filteredItems = actionItems.filter((item) => {
    const matchesSearch =
      item.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter.length === 0 ||
      (item.status && statusFilter.includes(item.status));

    const matchesDate =
      !meetingDateFilter ||
      (item.meetingDate &&
        formatDate(item.meetingDate) === formatDate(meetingDateFilter));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const getStatusVariant = (
    status?: string | null
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "completed":
        return "default";
      case "in progress":
        return "secondary";
      case "pending":
        return "outline";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status?: string | null): string => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "in progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "overdue":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleComplete = async (
    meetingId: string,
    itemId: string,
    newStatus: string
  ) => {
    try {
      await updateActionItemStatus(meetingId, itemId, {
        status: newStatus,
      });
      setRefreshToggle((prev) => !prev);
      setError(null);
    } catch (err) {
      console.error("Failed to update action item status:", err);
      setError("Failed to complete action item");
    }
  };

  const handlePreview = (item: ActionItem) => {
    setSelectedItem(item);
    setIsPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Loading action items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="p-6 text-center max-w-md border-red-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Action Items</h1>
            <Badge variant="outline" className="text-sm">
              {filteredItems.length} items
            </Badge>
          </div>
          <p className="text-gray-600">
            Manage and track all your action items in one place
          </p>
        </motion.div>

        <Card className="p-6 shadow-sm border-0">
          {/* Search and Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col lg:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search action items or owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="relative flex-1 lg:flex-none">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                value={meetingDateFilter}
                onChange={(e) => setMeetingDateFilter(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 transition-colors"
                placeholder="Filter by meeting date"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300"
                >
                  <Filter className="h-4 w-4" />
                  Status
                  {statusFilter.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-blue-100 text-blue-700"
                    >
                      {statusFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {statusOptions.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={() => toggleStatusFilter(status)}
                    className="capitalize"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          getStatusColor(status).split(" ")[0]
                        }`}
                      />
                      {status}
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {actionItems.length}
              </div>
              <div className="text-sm text-blue-700">Total Items</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {
                  actionItems.filter((item) => item.status === "completed")
                    .length
                }
              </div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">
                {actionItems.filter((item) => item.status === "pending").length}
              </div>
              <div className="text-sm text-yellow-700">Pending</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {actionItems.filter((item) => item.status === "overdue").length}
              </div>
              <div className="text-sm text-red-700">Overdue</div>
            </div>
          </motion.div>

          {/* Table */}
          <ScrollArea className="border border-gray-200 rounded-lg">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700">
                    Meeting Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 w-[40%]">
                    Action Point
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Owner
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Due Date
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-32">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Search className="h-8 w-8 mb-2 text-gray-300" />
                          <p>No action items found</p>
                          <p className="text-sm">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item, index) => (
                      <motion.tr
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {item.meetingDate
                              ? formatDate(item.meetingDate)
                              : "Not set"}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="max-w-[300px]">
                            <p className="font-medium text-gray-900 line-clamp-2 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(item.status)}
                            className={`capitalize border ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status || "Not set"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4 text-gray-400" />
                            {item.owner || "Unassigned"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {formatDate(item.due)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog
                              open={
                                isPreviewOpen && selectedItem?._id === item._id
                              }
                              onOpenChange={setIsPreviewOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePreview(item)}
                                  className="h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    Action Item Details
                                  </DialogTitle>
                                  <DialogDescription>
                                    Complete information for this action item
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-700 mb-2">
                                      Description
                                    </h3>
                                    <p className="text-gray-900">
                                      {selectedItem?.desc}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="font-semibold text-gray-700 text-sm mb-1">
                                        Status
                                      </h3>
                                      <Badge
                                        variant={getStatusVariant(
                                          selectedItem?.status
                                        )}
                                      >
                                        {selectedItem?.status || "Not set"}
                                      </Badge>
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-700 text-sm mb-1">
                                        Owner
                                      </h3>
                                      <p className="text-gray-900">
                                        {selectedItem?.owner || "Unassigned"}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-700 text-sm mb-1">
                                        Due Date
                                      </h3>
                                      <p className="text-gray-900">
                                        {formatDate(selectedItem?.due)}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-700 text-sm mb-1">
                                        Meeting Date
                                      </h3>
                                      <p className="text-gray-900">
                                        {formatDate(selectedItem?.meetingDate)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant={
                                item.status === "completed"
                                  ? "outline"
                                  : "default"
                              }
                              size="sm"
                              onClick={() => {
                                handleComplete(
                                  item.meetingId,
                                  item._id,
                                  "completed"
                                );
                              }}
                              disabled={item.status === "completed"}
                              className={`h-9 w-9 p-0 transition-all ${
                                item.status === "completed"
                                  ? "bg-green-100 text-green-600 border-green-200"
                                  : "hover:scale-105"
                              }`}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}

export default ActionItemsPage;
