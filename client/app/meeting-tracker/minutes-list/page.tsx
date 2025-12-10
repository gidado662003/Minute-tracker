"use client";
import React, { useState, useEffect } from "react";
import { getMeetings } from "@/app/api";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import ViewDialog from "@/components/view-dialog";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import {
  Search,
  Loader2,
  Calendar,
  User,
  Flag,
  Eye,
  Clock,
  ChevronRight,
  CheckCircle,
  Filter,
  X,
  CalendarDays,
  Users,
  FileText,
  Calendar as CalendarIcon,
  Hash,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

type ActionItem = {
  _id: string;
  desc: string;
  owner?: string;
  due?: string | Date | null;
  priority?: "low" | "medium" | "high";
};

type Minute = {
  _id: string;
  title: string;
  date: string | Date;
  agenda?: string;
  minutes?: string;
  attendees: string[];
  actionItems?: ActionItem[];
  tags?: string[];
};

export default function MinutesList() {
  const [minutes, setMinutes] = useState<Minute[]>([]);
  const [selectedMinute, setSelectedMinute] = useState<Minute | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasFilters, setHasFilters] = useState(false);

  useEffect(() => {
    setHasFilters(!!searchTerm || !!startDate || !!endDate);
  }, [searchTerm, startDate, endDate]);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const data = await getMeetings();
        const sortedData = [...data].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMinutes(sortedData);
        if (sortedData.length > 0) {
          setSelectedMinute(sortedData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch meetings:", err);
        setError(
          "Failed to load meetings. Please check your network connection."
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  const filteredMinutes = minutes.filter((minute) => {
    const minuteDate = new Date(minute.date);
    const startFilterDate = startDate ? new Date(startDate) : null;
    const endFilterDate = endDate ? new Date(endDate) : null;

    const matchesSearchTerm =
      minute.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      minute.agenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      minute.actionItems?.some((item) =>
        item.desc?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDateRange =
      (!startFilterDate || minuteDate >= startFilterDate) &&
      (!endFilterDate || minuteDate <= endFilterDate);

    return matchesSearchTerm && matchesDateRange;
  });

  const sortedMeetings = [...filteredMinutes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative mx-auto w-20 h-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-500"
            />
            <FileText className="absolute inset-0 m-auto h-10 w-10 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              Loading Meetings
            </h3>
            <p className="text-gray-500 text-sm">
              Fetching your meeting minutes and action items...
            </p>
          </div>
          <Progress value={33} className="w-full h-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-2xl border-0 bg-gradient-to-br from-white to-red-50/20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <AlertCircle className="h-10 w-10 text-red-500" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => setError(null)}
              className="border-gray-300"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="w-full shadow-2xl rounded-3xl overflow-hidden flex flex-col lg:flex-row min-h-[75vh] border-0 bg-gradient-to-br from-white/95 via-white to-blue-50/30 backdrop-blur-sm">
          {/* Left Pane: Meetings List */}
          <div className="w-full lg:w-2/5 xl:w-1/3 bg-gradient-to-b from-white/95 to-blue-50/30 p-6 lg:p-8 flex flex-col border-r border-blue-100/50">
            <div className="space-y-6 mb-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder="Search meetings, agendas, actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-10 py-4 w-full rounded-2xl border-2 border-gray-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 bg-white/70 shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <X className="h-3.5 w-3.5 mr-1.5" />
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                      <Label className="text-xs font-semibold text-gray-700">
                        From
                      </Label>
                    </div>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="py-2.5 text-sm rounded-xl border-gray-200 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                      <Label className="text-xs font-semibold text-gray-700">
                        To
                      </Label>
                    </div>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="py-2.5 text-sm rounded-xl border-gray-200 bg-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Status filter removed as it's no longer needed */}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span>Recent Meetings</span>
              </h2>
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200"
              >
                {filteredMinutes.length} meeting
                {filteredMinutes.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <ScrollArea className="mt-2 h-[70vh] pr-4">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredMinutes.length === 0 ? (
                    <motion.div
                      key="no-results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-12 px-4 rounded-2xl bg-gradient-to-br from-gray-50/50 to-white/50 border-2 border-dashed border-gray-200"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-semibold mb-1.5">
                        No meetings found
                      </p>
                      <p className="text-gray-500 text-sm mb-4">
                        {hasFilters
                          ? "Try adjusting your search or filters"
                          : "No meetings scheduled yet"}
                      </p>
                      {hasFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="rounded-full px-4"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    sortedMeetings.map((minute) => {
                      return (
                        <motion.div
                          key={minute._id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => setSelectedMinute(minute)}
                          className={cn(
                            "p-5 rounded-2xl cursor-pointer transition-all duration-300 border group",
                            "hover:shadow-xl hover:border-blue-300 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/50",
                            "active:scale-[0.99]",
                            selectedMinute?._id === minute._id
                              ? "bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-300 shadow-lg ring-2 ring-blue-100"
                              : "bg-white/80 border-gray-100 shadow-sm"
                          )}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-800 transition-colors text-base">
                                  {minute.title}
                                </h3>
                                <div className="flex items-center mt-2 text-sm text-gray-600">
                                  <CalendarIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-blue-500" />
                                  <span className="truncate">
                                    {new Date(minute.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight
                                className={cn(
                                  "h-5 w-5 transition-all duration-300 flex-shrink-0 ml-2",
                                  "group-hover:text-blue-500 group-hover:translate-x-1",
                                  selectedMinute?._id === minute._id
                                    ? "text-blue-600 transform translate-x-1"
                                    : "text-gray-300"
                                )}
                              />
                            </div>

                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Users className="h-3.5 w-3.5 text-green-500" />
                                  <span className="text-xs font-medium text-gray-700">
                                    {minute.attendees.length} attendee
                                    {minute.attendees.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                {minute.actionItems &&
                                  minute.actionItems.length > 0 && (
                                    <div className="flex items-center gap-1.5">
                                      <Target className="h-3.5 w-3.5 text-red-500" />
                                      <span className="text-xs font-semibold text-gray-800">
                                        {minute.actionItems.length}
                                      </span>
                                    </div>
                                  )}
                              </div>

                              {minute.actionItems &&
                                minute.actionItems.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-600">
                                        Action items
                                      </span>
                                      <span className="font-semibold text-blue-600">
                                        {minute.actionItems.length}
                                      </span>
                                    </div>
                                  </div>
                                )}
                            </div>

                            {minute.tags && minute.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
                                {minute.tags.slice(0, 2).map((tag, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-[10px] py-0.5 px-2 bg-gray-50/50 text-gray-600 border-gray-200"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {minute.tags.length > 2 && (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] py-0.5 px-2 bg-gray-50/50 text-gray-500 border-gray-200"
                                  >
                                    +{minute.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          {/* Right Pane: Meeting Details */}
          <div className="flex-1 bg-gradient-to-br from-white via-white/95 to-blue-50/20 p-6 lg:p-8">
            <ScrollArea className="h-[120vh] pr-4">
              <AnimatePresence mode="wait">
                {selectedMinute ? (
                  <motion.div
                    key={selectedMinute._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col space-y-8"
                  >
                    {/* Header Section */}
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-4">
                          <Badge
                            variant="outline"
                            className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border-blue-200"
                          >
                            <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
                            Meeting Minutes
                          </Badge>
                          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight pr-4">
                            {selectedMinute.title}
                          </h1>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 rounded-xl border border-gray-200 hover:bg-gray-50"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-xl"
                          >
                            <DropdownMenuItem>Export PDF</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuItem>Print</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card className="p-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/20">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-blue-100">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Date
                              </p>
                              <p className="text-base font-semibold text-gray-900">
                                {new Date(
                                  selectedMinute.date
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-green-100/20">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-green-100">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Attendees
                              </p>
                              <p className="text-base font-semibold text-gray-900">
                                {selectedMinute.attendees.length} people
                              </p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/20">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-purple-100">
                              <Target className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Actions
                              </p>
                              <p className="text-base font-semibold text-gray-900">
                                {selectedMinute.actionItems?.length || 0} items
                              </p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>

                    {/* Content Sections */}
                    <div className="space-y-8 flex-1">
                      <section className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                            <Hash className="h-5 w-5 text-white" />
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Agenda
                          </h2>
                        </div>
                        <Card className="p-6 rounded-2xl border border-blue-100/50 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                            {selectedMinute.agenda ||
                              "No agenda provided for this meeting."}
                          </p>
                        </Card>
                      </section>

                      {selectedMinute.minutes && (
                        <section className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              Minutes
                            </h2>
                          </div>
                          <Card className="p-6 rounded-2xl border border-green-100/50 bg-gradient-to-br from-white to-green-50/30 shadow-sm">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                              {selectedMinute.minutes}
                            </p>
                          </Card>
                        </section>
                      )}

                      {selectedMinute.actionItems &&
                        selectedMinute.actionItems.length > 0 && (
                          <section className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-md">
                                  <Flag className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    Action Items
                                  </h2>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Track and manage action items from this
                                    meeting
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className="px-3 py-1.5 text-sm font-semibold bg-red-50 text-red-700 border-red-200"
                              >
                                {selectedMinute.actionItems.length} total
                              </Badge>
                            </div>

                            <div className="grid gap-4">
                              {selectedMinute.actionItems.map((item, i) => (
                                <motion.div
                                  key={item._id || i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className={cn(
                                    "p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:shadow-lg",
                                    "group hover:scale-[1.01]",
                                    "bg-gradient-to-br from-gray-50/80 to-gray-100/30 border-gray-200"
                                  )}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-4">
                                      <div className="flex items-start gap-3">
                                        <div
                                          className={cn(
                                            "w-3 h-3 rounded-full mt-2 flex-shrink-0",
                                            getPriorityColor(item.priority)
                                          )}
                                        />
                                        <div className="space-y-2">
                                          <p className="font-semibold text-gray-900 text-lg">
                                            {item.desc}
                                          </p>

                                          <div className="flex flex-wrap items-center gap-4 text-sm">
                                            {item.owner && (
                                              <div className="flex items-center text-gray-700 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200">
                                                <User className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                                <span className="font-medium">
                                                  {item.owner}
                                                </span>
                                              </div>
                                            )}
                                            {item.due && (
                                              <div
                                                className={cn(
                                                  "flex items-center px-3 py-1.5 rounded-full border",
                                                  new Date() >
                                                    new Date(item.due)
                                                    ? "bg-red-50/80 text-red-700 border-red-200"
                                                    : "bg-amber-50/80 text-amber-700 border-amber-200"
                                                )}
                                              >
                                                <Clock className="h-3.5 w-3.5 mr-2" />
                                                <span className="font-medium">
                                                  Due{" "}
                                                  {new Date(
                                                    item.due
                                                  ).toLocaleDateString()}
                                                </span>
                                              </div>
                                            )}
                                            {/* Status badge removed */}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-10 w-10 p-0 rounded-xl border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl rounded-2xl">
                                          <ViewDialog data={item} />
                                        </DialogContent>
                                      </Dialog>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </section>
                        )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="no-selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center p-12"
                  >
                    <div className="text-center max-w-md space-y-6">
                      <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                          <FileText className="h-16 w-16 text-blue-500" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold text-gray-800">
                          Select a Meeting
                        </h3>
                        <p className="text-gray-600">
                          Choose a meeting from the list to view detailed
                          minutes, agendas, and track action items in real-time.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4" />
                        <span>Click on any meeting card to get started</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>
        </Card>
      </div>
    </div>
  );
}
