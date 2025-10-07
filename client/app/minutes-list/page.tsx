"use client";
import React, { useState, useEffect } from "react";
import { getMeetings, updateActionItemStatus } from "@/app/api";
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
  CheckCircle2,
  PlayCircle,
  Clock4,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type ActionItem = {
  _id: string;
  desc: string;
  owner?: string;
  due?: string | Date | null;
  status?: string;
};

type Minute = {
  _id: string;
  title: string;
  date: string | Date;
  agenda?: string;
  attendees: string[];
  actionItems?: ActionItem[];
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

  // Update hasFilters when filters change
  useEffect(() => {
    setHasFilters(!!searchTerm || !!startDate || !!endDate);
  }, [searchTerm, startDate, endDate]);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const data = await getMeetings();
        setMinutes(data);
        if (data.length > 0) {
          setSelectedMinute(data[0]);
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

  const handleActionItemStatusChange = async (
    meetingId: string,
    itemId: string,
    newStatus: string
  ) => {
    try {
      await updateActionItemStatus(meetingId, itemId, { status: newStatus });

      setMinutes((prevMinutes) =>
        prevMinutes.map((minute) => {
          if (minute._id === meetingId) {
            const updatedActionItems = minute.actionItems?.map((item) =>
              item._id === itemId ? { ...item, status: newStatus } : item
            );

            const sortedActionItems = updatedActionItems?.sort((a, b) => {
              if (a.status === "completed" && b.status !== "completed")
                return 1;
              if (a.status !== "completed" && b.status === "completed")
                return -1;
              return 0;
            });

            return {
              ...minute,
              actionItems: sortedActionItems,
            };
          }
          return minute;
        })
      );

      setSelectedMinute((prevSelected) => {
        if (!prevSelected || prevSelected._id !== meetingId)
          return prevSelected;

        const updatedActionItems = prevSelected.actionItems?.map((item) =>
          item._id === itemId ? { ...item, status: newStatus } : item
        );

        const sortedActionItems = updatedActionItems?.sort((a, b) => {
          if (a.status === "completed" && b.status !== "completed") return 1;
          if (a.status !== "completed" && b.status === "completed") return -1;
          return 0;
        });

        return { ...prevSelected, actionItems: sortedActionItems };
      });
    } catch (err) {
      console.error("Failed to update action item status:", err);
      setError("Failed to update action item. Please try again.");
    }
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

  // Sort meetings by date (newest first)
  const sortedMeetings = [...filteredMinutes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in progress":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4" />;
      case "in progress":
        return <PlayCircle className="h-4 w-4" />;
      case "pending":
        return <Clock4 className="h-4 w-4" />;
      default:
        return <Clock4 className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm opacity-20 animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading meetings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center border border-red-100"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-red-500 font-semibold mb-2">{error}</p>
          <p className="text-gray-600 text-sm mb-4">
            There was an issue loading your meetings.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center space-y-2"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
            Meeting Minutes
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review meeting details, agendas, and track action items in one place
          </p>
        </motion.div>

        <Card className="w-full shadow-xl rounded-2xl overflow-hidden flex flex-col lg:flex-row min-h-[75vh] border-0 bg-white/80 backdrop-blur-sm">
          {/* Left Pane: Meetings List */}
          <div className="w-full lg:w-1/3 bg-white/95 p-6 flex flex-col border-r border-gray-100/60">
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search meetings, agendas, actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Filters
                  </span>
                </div>
                {hasFilters && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-gray-700 h-8"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="start-date"
                    className="text-xs font-medium text-gray-600 flex items-center gap-1"
                  >
                    <CalendarDays className="h-3 w-3" />
                    From
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="py-2 text-sm rounded-lg border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="end-date"
                    className="text-xs font-medium text-gray-600 flex items-center gap-1"
                  >
                    <CalendarDays className="h-3 w-3" />
                    To
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="py-2 text-sm rounded-lg border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Meetings
              </h2>
              <Badge variant="secondary" className="text-xs font-medium">
                {filteredMinutes.length}{" "}
                {filteredMinutes.length === 1 ? "meeting" : "meetings"}
              </Badge>
            </div>

            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredMinutes.length === 0 ? (
                    <motion.div
                      key="no-results"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-12 px-4 rounded-xl bg-gray-50/50 border border-dashed border-gray-200"
                    >
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium mb-1">
                        No meetings found
                      </p>
                      <p className="text-gray-400 text-sm">
                        {hasFilters
                          ? "Try adjusting your filters"
                          : "No meetings available yet"}
                      </p>
                      {hasFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="mt-3"
                        >
                          Clear filters
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    sortedMeetings.map((minute) => (
                      <motion.div
                        key={minute._id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedMinute(minute)}
                        className={cn(
                          "p-4 rounded-xl cursor-pointer transition-all duration-200 border group",
                          "hover:shadow-md hover:border-blue-200 hover:bg-blue-50/30",
                          selectedMinute?._id === minute._id
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "bg-white border-gray-100"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-800 transition-colors">
                              {minute.title}
                            </h3>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
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
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Users className="h-3 w-3 mr-1.5 flex-shrink-0" />
                              <span className="truncate">
                                {minute.attendees.length} attendees
                              </span>
                            </div>
                            {minute.actionItems &&
                              minute.actionItems.length > 0 && (
                                <div className="flex items-center mt-2">
                                  <Flag className="h-3 w-3 mr-1.5 text-red-500 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {minute.actionItems.length} action items
                                  </span>
                                </div>
                              )}
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-5 w-5 text-gray-300 transition-all duration-200 flex-shrink-0 ml-2",
                              "group-hover:text-blue-400",
                              selectedMinute?._id === minute._id &&
                                "text-blue-500 transform translate-x-0.5"
                            )}
                          />
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          {/* Right Pane: Meeting Details */}
          <div className="w-full lg:w-2/3 bg-gradient-to-br from-white to-blue-50/20 p-6 lg:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              {selectedMinute ? (
                <motion.div
                  key={selectedMinute._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col space-y-8"
                >
                  {/* Header Section */}
                  <div className="pb-6 border-b border-gray-200/60">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-3">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium text-blue-600 border-blue-200"
                        >
                          Meeting Minutes
                        </Badge>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                          {selectedMinute.title}
                        </h1>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs font-medium"
                      >
                        {selectedMinute.actionItems?.length || 0} actions
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                        <div>
                          <span className="text-sm font-medium">Date</span>
                          <p className="text-sm">
                            {new Date(selectedMinute.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                weekday: "long",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start text-gray-700">
                        <Users className="h-4 w-4 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Attendees</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {selectedMinute.attendees.map((item, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs py-1 px-2 bg-green-50 text-green-700 border-green-200"
                              >
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Sections */}
                  <div className="space-y-8 flex-1">
                    {selectedMinute.agenda && (
                      <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            Meeting Agenda
                          </h2>
                        </div>
                        <Card className="p-6 rounded-xl border border-blue-100/50 bg-blue-50/20 shadow-sm">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                            {selectedMinute.agenda}
                          </p>
                        </Card>
                      </motion.section>
                    )}

                    <Separator className="my-6" />

                    {selectedMinute.actionItems &&
                      selectedMinute.actionItems.length > 0 && (
                        <motion.section
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <h2 className="text-xl font-semibold text-gray-800">
                                Action Items
                              </h2>
                              <Badge variant="outline" className="ml-2">
                                {selectedMinute.actionItems.length}
                              </Badge>
                            </div>
                          </div>

                          <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                              {selectedMinute.actionItems.map((item, i) => (
                                <motion.div
                                  key={item._id || i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.1 }}
                                  className={cn(
                                    "p-5 rounded-xl border shadow-sm transition-all duration-200",
                                    "hover:shadow-md",
                                    item.status === "completed"
                                      ? "bg-green-50/50 border-green-200"
                                      : "bg-white border-gray-100"
                                  )}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-3">
                                      <p
                                        className={cn(
                                          "font-medium text-gray-900",
                                          item.status === "completed" &&
                                            "line-through text-gray-500"
                                        )}
                                      >
                                        {item.desc}
                                      </p>

                                      <div className="flex flex-wrap gap-4 text-sm">
                                        {item.owner && (
                                          <div className="flex items-center text-gray-600">
                                            <User className="h-4 w-4 mr-2" />
                                            <span>{item.owner}</span>
                                          </div>
                                        )}
                                        {item.due && (
                                          <div
                                            className={`flex items-center ${
                                              new Date() < new Date(item.due)
                                                ? "text-gray-600"
                                                : "text-red-600"
                                            }`}
                                          >
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span className="mx-2">
                                              Due:{" "}
                                              {new Date(
                                                item.due
                                              ).toLocaleDateString()}
                                            </span>
                                            <span>
                                              {new Date() >
                                                new Date(item.due) &&
                                                "Due Date reached"}
                                            </span>
                                          </div>
                                        )}
                                        {item.status && (
                                          <Badge
                                            variant={getStatusVariant(
                                              item.status
                                            )}
                                            className="flex items-center gap-1"
                                          >
                                            {getStatusIcon(item.status)}
                                            {item.status}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex space-x-2 ml-4">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 w-9 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50 border-gray-200"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                          <ViewDialog data={item} />
                                        </DialogContent>
                                      </Dialog>

                                      {item.status !== "completed" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            handleActionItemStatusChange(
                                              selectedMinute._id,
                                              item._id,
                                              "completed"
                                            );
                                          }}
                                          className="h-9 w-9 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                          title="Mark as completed"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </ScrollArea>
                        </motion.section>
                      )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-gray-400 p-8"
                >
                  <div className="text-center max-w-sm space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-10 w-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-500 mb-2">
                        Select a Meeting
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Choose a meeting from the list to view its details,
                        agenda, and action items.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}
