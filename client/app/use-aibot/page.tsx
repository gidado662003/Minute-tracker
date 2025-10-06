"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  InfoIcon,
  CheckCircle2,
  ClipboardList,
  Edit,
  Save,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMeeting } from "@/app/api";

function UseAiBot() {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [editableData, setEditableData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("meetingDraft");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setEditableData(parsedData);
        setIsEditing(true);
        console.log("Loaded draft from localStorage:", parsedData);
      } catch (err) {
        console.error("Error loading draft from localStorage:", err);
        localStorage.removeItem("meetingDraft");
      }
    }
  }, []);

  // Save to localStorage whenever editableData changes
  useEffect(() => {
    if (editableData) {
      localStorage.setItem("meetingDraft", JSON.stringify(editableData));
    } else {
      localStorage.removeItem("meetingDraft");
    }
  }, [editableData]);

  // Auto-enter edit mode when data is received
  useEffect(() => {
    if (editableData) {
      setIsEditing(true);
    }
  }, [editableData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter meeting text");
      return;
    }

    setIsLoading(true);
    setError("");
    setEditableData(null);

    try {
      const response = await fetch("http://localhost:5678/webhook/ai-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!response.ok) throw new Error("Failed to parse meeting");

      const data = await response.json();
      // Handle both array and object responses
      const processedData = Array.isArray(data) ? data[0] : data;
      setEditableData(processedData);
    } catch (err) {
      console.error(err);
      setError("Failed to process meeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditableData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleActionItemChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setEditableData((prev: any) => {
      const newItems = [...prev.actionItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, actionItems: newItems };
    });
  };

  const addActionItem = () => {
    setEditableData((prev: any) => ({
      ...prev,
      actionItems: [
        ...(prev.actionItems || []),
        {
          desc: "",
          penalty: "N/A",
          owner: "",
          due: new Date().toISOString().split("T")[0],
          status: "pending",
        },
      ],
    }));
  };

  const removeActionItem = (index: number) => {
    setEditableData((prev: any) => ({
      ...prev,
      actionItems: prev.actionItems.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSaveEdits = async () => {
    setIsEditing(false);
    try {
      const response = await createMeeting(editableData);
      console.log("Meeting saved to database:", response);
      // Clear localStorage after successful save
      localStorage.removeItem("meetingDraft");
    } catch (err) {
      console.error("Failed to save meeting:", err);
      setError("Failed to save meeting to database.");
    }
  };

  const handleFinalSubmit = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableData),
      });

      if (!res.ok) throw new Error("Failed to submit");
      alert("Meeting data submitted successfully!");

      // Clear everything after successful submission
      setEditableData(null);
      setDescription("");
      setIsEditing(false);
      localStorage.removeItem("meetingDraft");
    } catch (err) {
      setError("Failed to submit meeting data.");
    }
  };

  const handleAttendeesChange = (value: string) => {
    const attendeesArray = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    handleFieldChange("attendees", attendeesArray);
  };

  const handleDepartmentChange = (value: string) => {
    handleFieldChange("department", value);
  };

  const clearDraft = () => {
    setEditableData(null);
    setDescription("");
    setIsEditing(false);
    localStorage.removeItem("meetingDraft");
    setError("");
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Helper function to safely access data
  const getFieldValue = (field: string) => {
    return editableData?.[field] || "";
  };

  const getActionItems = () => {
    return editableData?.actionItems || [];
  };

  const exampleText = `Team Meeting - October 15, 2025
Attendees: Mr. Tunde, Mrs. Sarah, Dr. James, Ms. Amina

Discussed project progress and departmental updates.

1. Firstly, Mrs. Sarah will complete the financial report by October 20, 2025 with a penalty of $200 for delay.
2. Secondly, Dr. James will submit final paper by October 25, 2025.
3. Thirdly, Ms. Amina to coordinate client meeting by October 18, 2025.
4. Finally, Mr. Tunde will upgrade system infrastructure by November 1, 2025.`;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-blue-600" />
                AI Meeting Parser
              </CardTitle>
              <CardDescription>
                Convert meeting notes into structured JSON format.
                {editableData && (
                  <span className="text-green-600 ml-2">
                    • Draft auto-saved locally
                  </span>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {!editableData && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Meeting Notes</label>
                    <Textarea
                      rows={10}
                      placeholder="Paste your meeting notes here..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="resize-none font-mono text-sm"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{description.length} characters</span>
                      <button
                        type="button"
                        onClick={() => setDescription(exampleText)}
                        className="text-blue-600 hover:underline"
                      >
                        Load Example
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !description.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Parsing Meeting...
                      </>
                    ) : (
                      "Parse Meeting Notes"
                    )}
                  </Button>
                </form>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {editableData && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {isEditing ? "Edit Meeting Data" : "Parsed Results"}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={toggleEditMode}
                        variant={isEditing ? "outline" : "default"}
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {isEditing ? "View Mode" : "Edit Mode"}
                      </Button>
                      {isEditing ? (
                        <Button onClick={handleSaveEdits} size="sm">
                          <Save className="h-4 w-4 mr-2" /> Save to Database
                        </Button>
                      ) : (
                        <Button
                          onClick={handleFinalSubmit}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Submit Final
                        </Button>
                      )}
                      <Button
                        onClick={clearDraft}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Clear Draft
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-6 space-y-6">
                      {/* Title + Date + Department */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Meeting Title</Label>
                          <Input
                            value={getFieldValue("title")}
                            onChange={(e) =>
                              handleFieldChange("title", e.target.value)
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={getFieldValue("date")}
                            onChange={(e) =>
                              handleFieldChange("date", e.target.value)
                            }
                            disabled={!isEditing}
                          />
                        </div>
                        <div>
                          <Label>Department</Label>
                          <Input
                            value={getFieldValue("department") || ""}
                            onChange={(e) =>
                              handleDepartmentChange(e.target.value)
                            }
                            disabled={!isEditing}
                            placeholder="e.g., IT, HR, Management"
                          />
                        </div>
                      </div>

                      {/* Attendees */}
                      <div>
                        <Label>Attendees (comma-separated)</Label>
                        <Textarea
                          value={
                            Array.isArray(getFieldValue("attendees"))
                              ? getFieldValue("attendees").join(", ")
                              : getFieldValue("attendees") || ""
                          }
                          onChange={(e) =>
                            handleAttendeesChange(e.target.value)
                          }
                          disabled={!isEditing}
                          placeholder="Mr. John, Mrs. Smith, Dr. Brown"
                          rows={2}
                        />
                      </div>

                      {/* Agenda */}
                      <div>
                        <Label>Agenda</Label>
                        <Textarea
                          value={getFieldValue("agenda")}
                          onChange={(e) =>
                            handleFieldChange("agenda", e.target.value)
                          }
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>

                      {/* Minutes */}
                      <div>
                        <Label>Minutes</Label>
                        <Textarea
                          value={getFieldValue("minutes")}
                          onChange={(e) =>
                            handleFieldChange("minutes", e.target.value)
                          }
                          disabled={!isEditing}
                          rows={4}
                        />
                      </div>

                      {/* Action Items */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-lg">Action Items</Label>
                          {isEditing && (
                            <Button
                              onClick={addActionItem}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-2" /> Add Action Item
                            </Button>
                          )}
                        </div>

                        <div className="space-y-4">
                          {getActionItems().map((item: any, i: number) => (
                            <Card key={i} className="p-4 border-2">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium text-base">
                                  Action Item #{i + 1}
                                </h4>
                                {isEditing && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeActionItem(i)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <Label>Description</Label>
                                  <Textarea
                                    value={item.desc || ""}
                                    onChange={(e) =>
                                      handleActionItemChange(
                                        i,
                                        "desc",
                                        e.target.value
                                      )
                                    }
                                    disabled={!isEditing}
                                    placeholder="Describe the action item..."
                                    rows={2}
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Owner</Label>
                                    <Input
                                      value={item.owner || ""}
                                      onChange={(e) =>
                                        handleActionItemChange(
                                          i,
                                          "owner",
                                          e.target.value
                                        )
                                      }
                                      disabled={!isEditing}
                                      placeholder="Assign owner..."
                                    />
                                  </div>
                                  <div>
                                    <Label>Due Date</Label>
                                    <Input
                                      type="date"
                                      value={item.due || ""}
                                      onChange={(e) =>
                                        handleActionItemChange(
                                          i,
                                          "due",
                                          e.target.value
                                        )
                                      }
                                      disabled={!isEditing}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Status</Label>
                                    <Select
                                      value={item.status || "pending"}
                                      onValueChange={(v) =>
                                        handleActionItemChange(i, "status", v)
                                      }
                                      disabled={!isEditing}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="completed">
                                          Completed
                                        </SelectItem>
                                        <SelectItem value="ongoing">
                                          Ongoing
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label>Penalty</Label>
                                    <Input
                                      value={item.penalty || "N/A"}
                                      onChange={(e) =>
                                        handleActionItemChange(
                                          i,
                                          "penalty",
                                          e.target.value
                                        )
                                      }
                                      disabled={!isEditing}
                                      placeholder="Penalty for non-compliance..."
                                    />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Debug View */}
                  <details className="mt-4">
                    <summary className="cursor-pointer font-medium text-sm text-gray-600">
                      View Raw Data (Debug)
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                      {JSON.stringify(editableData, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5 text-blue-600" />
                Formatting Guide
              </CardTitle>
              <CardDescription>
                Follow these tips for best results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Best Practices:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Use full dates (e.g., October 15, 2025)</li>
                  <li>• Include titles before names (Mr, Mrs)</li>
                  <li>• Specify penalties clearly when mentioned</li>
                  <li>• List all attendees explicitly</li>
                  <li>• Use numbered points for action items</li>
                </ul>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm mb-2">Current Status:</h4>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>• Data received: {editableData ? "✅" : "❌"}</div>
                  <div>
                    • Edit mode: {isEditing ? "✅ Active" : "❌ Inactive"}
                  </div>
                  <div>• Action items: {getActionItems().length}</div>
                  <div>
                    • Auto-save: {editableData ? "✅ Enabled" : "❌ Disabled"}
                  </div>
                </div>
              </div>

              {editableData && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={clearDraft}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UseAiBot;
