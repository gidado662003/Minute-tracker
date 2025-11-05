"use client";
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash,
  Plus,
  Loader2,
  Calendar,
  Users,
  FileText,
  CheckCircle,
} from "lucide-react";
import { createMeeting } from "@/app/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

function CreateMeeting() {
  type ActionItem = { desc: string; owner?: string; due?: string | Date };
  type Minute = {
    title: string;
    date: string | Date;
    agenda?: string;
    attendees?: string[];
    actionItems?: ActionItem[];
  };

  const [formData, setFormData] = useState<Minute>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    agenda: "",
    attendees: [],
    actionItems: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // UI validation helpers
  const isTitleValid = (formData.title || "").trim().length >= 5;
  const areActionItemsValid = (formData.actionItems ?? []).every((item) => {
    const descOk = (item.desc || "").trim().length >= 3;
    const dueOk = !item.due || new Date(String(item.due)) > new Date();
    return descOk && dueOk;
  });
  const isFormValid = !!formData.date && isTitleValid && areActionItemsValid;

  async function handleCreateMeeting() {
    if (!isFormValid) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const now = new Date();
      const sanitizedActionItems = (formData.actionItems ?? [])
        .map((item) => ({
          desc: (item.desc ?? "").trim(),
          owner: (item.owner ?? "").trim(),
          due: item.due ? new Date(String(item.due)) : undefined,
        }))
        .filter((item) => item.desc.length >= 3)
        .map((item) => {
          const out: { desc: string; owner?: string; due?: Date } = {
            desc: item.desc,
          };
          if (item.owner) out.owner = item.owner;
          if (item.due && !isNaN(item.due.getTime()) && item.due > now)
            out.due = item.due;
          return out;
        });

      const payload = {
        title: formData.title.trim(),
        date: new Date(String(formData.date)),
        agenda: formData.agenda?.trim() || undefined,
        attendees: (formData.attendees ?? [])
          .map((a) => (a || "").trim())
          .filter((a) => a.length > 0),
        actionItems: sanitizedActionItems,
      };

      const response = await createMeeting(payload);
      console.log("Meeting created:", response);
      setSubmitMessage("Meeting created successfully!");

      // Reset form
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        agenda: "",
        attendees: [],
        actionItems: [],
      });
    } catch (error) {
      console.error("Failed to create meeting:", error);
      setSubmitMessage("Failed to create meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addActionItem = () => {
    setFormData((prev) => ({
      ...prev,
      actionItems: [
        ...(prev.actionItems ?? []),
        { desc: "", owner: "", due: "" },
      ],
    }));
  };

  const addAttendee = () => {
    setFormData((prev) => ({
      ...prev,
      attendees: [...(prev.attendees ?? []), ""],
    }));
  };

  const removeAttendee = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attendees: (prev.attendees ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleAttendeeChange = (index: number, value: string) => {
    setFormData((prev) => {
      const list = [...(prev.attendees ?? [])];
      list[index] = value;
      return { ...prev, attendees: list };
    });
  };

  const removeActionItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      actionItems: (prev.actionItems ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleActionItemChange = (
    index: number,
    key: keyof ActionItem,
    value: string
  ) => {
    setFormData((prev) => {
      const items = [...(prev.actionItems ?? [])];
      items[index] = { ...items[index], [key]: value };
      return { ...prev, actionItems: items };
    });
  };

  // Animation variants
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-indigo-50/30 py-2 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className=" bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Calendar className="w-8 h-8 mt-2" />
            </motion.div>
          </CardHeader>

          <CardContent className="p-8">
            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateMeeting();
              }}
            >
              {/* Basic Information */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Meeting Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="title"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Meeting Title *
                        </Label>
                        <Input
                          type="text"
                          name="title"
                          id="title"
                          value={formData.title}
                          onChange={handleFormChange}
                          placeholder="Weekly Team Sync"
                          className="h-12 text-base border-gray-300 focus:border-blue-500"
                        />
                        {formData.title && !isTitleValid && (
                          <p className="text-sm text-red-500">
                            Title must be at least 5 characters
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label
                          htmlFor="date"
                          className="text-sm font-medium flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Meeting Date
                        </Label>
                        <Input
                          type="date"
                          name="date"
                          id="date"
                          value={String(formData.date)}
                          onChange={handleFormChange}
                          className="h-12 text-base border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Attendees */}
                    <div className="space-y-4">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Attendees
                      </Label>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {(formData.attendees ?? []).map((attendee, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center gap-3"
                            >
                              <Input
                                type="text"
                                value={attendee}
                                onChange={(e) =>
                                  handleAttendeeChange(index, e.target.value)
                                }
                                placeholder="Enter attendee name"
                                className="flex-1 border-gray-300 focus:border-blue-500"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeAttendee(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                Remove
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addAttendee}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Attendee
                        </Button>
                      </div>
                    </div>

                    {/* Agenda */}
                    <div className="space-y-3">
                      <Label htmlFor="agenda" className="text-sm font-medium">
                        Meeting Agenda
                      </Label>
                      <Textarea
                        id="agenda"
                        name="agenda"
                        value={formData.agenda}
                        placeholder="Enter key meeting agenda, discussion points, and decisions..."
                        className="min-h-[120px] resize-y border-gray-300 focus:border-blue-500"
                        onChange={handleFormChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Action Items */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Action Items
                        <Badge variant="outline" className="ml-2">
                          {formData.actionItems?.length || 0}
                        </Badge>
                      </CardTitle>
                      <Button
                        type="button"
                        onClick={addActionItem}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <AnimatePresence>
                        {formData.actionItems?.length === 0 ? (
                          <motion.div
                            key="no-items"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-8 text-gray-500"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <CheckCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <p>No action items yet.</p>
                            <p className="text-sm">
                              Add your first action item to get started!
                            </p>
                          </motion.div>
                        ) : (
                          formData.actionItems?.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -20, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative"
                            >
                              <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200 hover:border-blue-300 transition-all duration-200">
                                <CardContent className="p-0 grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`desc-${index}`}
                                      className="text-sm font-medium"
                                    >
                                      Description *
                                    </Label>
                                    <Input
                                      type="text"
                                      name="desc"
                                      id={`desc-${index}`}
                                      value={item.desc}
                                      onChange={(e) =>
                                        handleActionItemChange(
                                          index,
                                          "desc",
                                          e.target.value
                                        )
                                      }
                                      placeholder="What needs to be done?"
                                      className="border-gray-300 focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`owner-${index}`}
                                      className="text-sm font-medium"
                                    >
                                      Owner
                                    </Label>
                                    <Input
                                      type="text"
                                      name="owner"
                                      id={`owner-${index}`}
                                      value={item.owner}
                                      onChange={(e) =>
                                        handleActionItemChange(
                                          index,
                                          "owner",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Who's responsible?"
                                      className="border-gray-300 focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`due-${index}`}
                                      className="text-sm font-medium"
                                    >
                                      Due Date
                                    </Label>
                                    <Input
                                      type="date"
                                      name="due"
                                      id={`due-${index}`}
                                      value={String(item.due)}
                                      onChange={(e) =>
                                        handleActionItemChange(
                                          index,
                                          "due",
                                          e.target.value
                                        )
                                      }
                                      className="border-gray-300 focus:border-blue-500"
                                    />
                                  </div>
                                </CardContent>
                                <Button
                                  type="button"
                                  onClick={() => removeActionItem(index)}
                                  className="absolute top-3 right-3 p-2 h-auto text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </Card>
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submit Section */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200"
              >
                <div className="flex-1">
                  <AnimatePresence>
                    {submitMessage && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-sm font-medium ${
                          submitMessage.includes("success")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {submitMessage}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <Button
                  type="submit"
                  className="px-8 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isFormValid || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating Meeting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Create Meeting
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default CreateMeeting;
