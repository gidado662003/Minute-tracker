import React from "react";
import { DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

function ViewDialog({ data }: { data: any }) {
  // Helper function to format keys for display
  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ");
  };

  // Helper function to determine if value should be treated as special type
  const getValueType = (value: any) => {
    if (value === null || value === undefined) return "empty";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (Array.isArray(value)) return "array";
    if (typeof value === "object") return "object";
    if (typeof value === "string") {
      // Check for date strings
      if (!isNaN(Date.parse(value)) && value.length > 8) return "date";
      // Check for URLs
      if (value.startsWith("http://") || value.startsWith("https://"))
        return "url";
      // Check for email
      if (value.includes("@") && value.includes(".")) return "email";
    }
    return "string";
  };

  // Helper function to format values based on type
  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Not set</span>;
    }

    switch (type) {
      case "boolean":
        return (
          <Badge variant={value ? "default" : "secondary"} className="ml-2">
            {value ? "Yes" : "No"}
          </Badge>
        );

      case "number":
        return <span className="font-mono text-blue-600">{value}</span>;

      case "date":
        return (
          <span className="text-green-600">
            {new Date(value).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        );

      case "url":
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {value}
          </a>
        );

      case "email":
        return (
          <a
            href={`mailto:${value}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {value}
          </a>
        );

      case "array":
        return (
          <div className="mt-1 space-y-1">
            {value.map((item: any, index: number) => (
              <Badge key={index} variant="outline" className="mr-1 mb-1">
                {String(item)}
              </Badge>
            ))}
          </div>
        );

      case "object":
        return (
          <Card className="mt-2">
            <CardContent className="p-3">
              <pre className="text-xs text-gray-600 overflow-x-auto">
                {JSON.stringify(value, null, 2)}
              </pre>
            </CardContent>
          </Card>
        );

      default:
        return <span className="text-gray-700">{String(value)}</span>;
    }
  };

  // Filter out empty or null values if desired
  const filteredEntries = Object.entries(data).filter(([_, value]) => {
    return value !== null && value !== undefined && value !== "";
  });

  if (!data || Object.keys(data).length === 0) {
    return (
      <div>
        <DialogHeader className="pb-4">
          <DialogTitle>View Details</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-gray-500">
          <p>No data available to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader className="pb-4 border-b">
        <DialogTitle className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Details Overview
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto py-2">
        <Card className="mx-2">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredEntries.map(([key, value]) => {
                const valueType = getValueType(value);
                const displayKey = formatKey(key);

                return (
                  <div
                    key={key}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm capitalize">
                              {displayKey}
                            </span>
                            {valueType !== "string" &&
                              valueType !== "empty" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs font-normal"
                                >
                                  {valueType}
                                </Badge>
                              )}
                          </div>
                          <div className="text-[20px] leading-snug">
                            {formatValue(value, valueType)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary section */}
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total properties: {filteredEntries.length}</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewDialog;
