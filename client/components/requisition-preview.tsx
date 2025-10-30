import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Building,
  Target,
  FileText,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

function RequisitionPreview({ data }) {
  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No requisition data available</p>
        </CardContent>
      </Card>
    );
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
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

  return (
    <div className="space-y-4">
      {/* Header with Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
        <div>
          <h2 className="text-lg font-bold text-gray-900 capitalize">
            {data.title}
          </h2>
          <p className="text-sm text-gray-600">{data.requisitionNumber}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={getStatusColor(data.status)} className="text-sm">
            {getStatusIcon(data.status)}
            <span className="ml-1 capitalize">{data.status}</span>
          </Badge>
          <Badge variant={getPriorityColor(data.priority)} className="text-sm">
            {getPriorityIcon(data.priority)}
            <span className="ml-1 capitalize">{data.priority}</span>
          </Badge>
        </div>
      </div>

      {/* Basic Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="font-semibold text-gray-900">{data.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Priority</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {data.priority}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Needed By</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(data.neededBy)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* <DollarSign className="h-4 w-4 text-emerald-500 flex-shrink-0" /> */}
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Amount
                </p>
                <p className="font-bold text-emerald-600 text-lg">
                  {formatCurrency(data.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purpose */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-purple-500" />
            <h3 className="font-semibold text-gray-900">Purpose</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{data.purpose}</p>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-indigo-500" />
            <h3 className="font-semibold text-gray-900">Requested Items</h3>
            <Badge variant="outline" className="ml-2">
              {data.items.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {data.items.map((item, index) => (
              <div
                key={item._id || index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 capitalize">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>
                      {item.quantity} {item.unit}
                    </span>
                    <span>•</span>
                    <span>{formatCurrency(item.unitPrice)} each</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">
                    {formatCurrency(item.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Timeline</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Created</span>
              <span className="font-medium">{formatDate(data.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium">{formatDate(data.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      {data.attachments && data.attachments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
            <div className="flex flex-wrap gap-2">
              {data.attachments.map((attachment, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {attachment.name || `Attachment ${index + 1}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RequisitionPreview;
