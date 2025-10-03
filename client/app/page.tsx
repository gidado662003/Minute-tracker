"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getMeetings,
  getCompletedMeetings,
  getAllActionItems,
  getDashboardTotals,
  getMonthlyMeetings,
  getTopOwners,
  getOverdueActions,
} from "@/app/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type Meeting = {
  _id: string;
  date: string | Date;
  title?: string;
  status?: string;
  actionItems?: { status?: string }[];
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [completedMeetings, setCompletedMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [totalsFromApi, setTotalsFromApi] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  console.log(monthly);
  const [topOwners, setTopOwners] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [m, cm, ai, t, mon, owners, od] = await Promise.all([
          getMeetings(),
          getCompletedMeetings(),
          getAllActionItems(),
          getDashboardTotals(),
          getMonthlyMeetings(),
          getTopOwners(),
          getOverdueActions(),
        ]);
        setMeetings(m || []);
        setCompletedMeetings(cm || []);
        setActionItems(ai || []);
        setTotalsFromApi(t || null);
        setMonthly(mon || []);
        setTopOwners(owners || []);
        setOverdue(od || []);
      } catch (e) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totals = useMemo(() => {
    const totalMeetings = meetings.length;
    const totalCompleted = completedMeetings.length;
    const totalActions = actionItems.length;
    const totalOpenActions = actionItems.filter(
      (a) => a.status !== "completed"
    ).length;
    return { totalMeetings, totalCompleted, totalActions, totalOpenActions };
  }, [meetings, completedMeetings, actionItems]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <Card className="p-6 text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </Card>
      </div>
    );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Overview of your meetings and action items
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Badge>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium">
                    Total Meetings
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {totalsFromApi?.totalMeetings ?? totals.totalMeetings}
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium">
                    Completed
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {totalsFromApi?.totalCompletedMeetings ??
                      totals.totalCompleted}
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium">
                    Action Items
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {totalsFromApi?.totalActionItems ?? totals.totalActions}
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 font-medium">
                    Open Actions
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {totalsFromApi?.totalOpenActionItems ??
                      totals.totalOpenActions}
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">⏳</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Meetings */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Meetings
                  </h3>
                  <Badge variant="secondary">
                    {meetings.slice(0, 5).length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {meetings.slice(0, 5).map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <div className="font-medium text-sm">
                            {m.title || "Meeting"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(m.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          m.status === "completed" ? "default" : "outline"
                        }
                      >
                        {m.status || "scheduled"}
                      </Badge>
                    </div>
                  ))}
                  {meetings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">📅</span>
                      </div>
                      <p>No meetings scheduled yet.</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Overdue Actions */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Overdue Action Items
                  </h3>
                  <Badge
                    variant={overdue.length > 0 ? "destructive" : "secondary"}
                  >
                    {overdue.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {overdue.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🎉</span>
                      </div>
                      <p>No overdue actions! Great job!</p>
                    </div>
                  ) : (
                    overdue.map((o, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {o.actionItem?.desc}
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            Due:{" "}
                            {o.actionItem?.due
                              ? new Date(o.actionItem.due).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                        <Badge variant="destructive" className="ml-2">
                          Overdue
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Monthly Meetings */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Monthly Meetings
                </h3>
                <div className="space-y-3">
                  {monthly.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No data available
                    </div>
                  ) : (
                    monthly.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <span className="text-sm font-medium">
                          {m._id?.month}/{m._id?.year}
                        </span>
                        <Badge variant="outline">{m.count}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Top Owners */}
            <motion.div variants={itemVariants}>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Action Owners
                </h3>
                <div className="space-y-3">
                  {topOwners.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No data available
                    </div>
                  ) : (
                    topOwners.map((o, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium">
                            {o._id || "Unassigned"}
                          </span>
                        </div>
                        <Badge variant="outline">{o.openActions}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
