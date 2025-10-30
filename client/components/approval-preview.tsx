"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { createInternalRequisition, spreedsheetHook } from "@/app/api";
import { useRouter } from "next/navigation";

interface ApprovalPreviewProps {
  formData: any;
  items: any[];
  attachments: any[];
  totalAmount: number;
  onBack: () => void;
  onSubmit: (finalFormData: any) => void;
}

export function ApprovalPreview({
  formData,
  items,
  attachments,
  totalAmount,
  onBack,
  onSubmit,
}: ApprovalPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const finalFormData = {
    ...formData,
    items: items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    })),
    attachments: attachments,
    totalAmount: totalAmount,
    requisitionNumber: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
    status: "pending",
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Unknown";
    return `₦ ${amount.toLocaleString()}`;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createInternalRequisition(finalFormData);
      // await spreedsheetHook(finalFormData);
      onSubmit(finalFormData);
      router.push("/internal-requisitions/requisition-list");
    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Requisition</h2>
        <p className="text-gray-600">Check everything before submitting</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">
          Request Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500">Title</span>
            <p className="font-medium">{formData.title}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Department</span>
            <p className="font-medium">{formData.department}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Priority</span>
            <Badge variant="outline" className="capitalize">
              {formData.priority}
            </Badge>
          </div>
          <div>
            <span className="text-sm text-gray-500">Requsted On</span>
            <p className="font-medium">
              {formData.requestedOn || "Not specified"}
            </p>
          </div>
        </div>
        {formData.purpose && (
          <>
            <div>
              <span className="text-sm text-gray-500">Purpose</span>
              <p className="font-medium mt-1">{formData.purpose}</p>
            </div>
          </>
        )}
      </div>

      {/* Items */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">
          Items ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <div>
                <p className="font-medium">
                  {index + 1}. {item.description}
                </p>
                <p className="text-sm text-gray-500">
                  {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                  {item.category && ` • ${item.category}`}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(item.total)}</p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
            <span>Total Amount:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">
            Attachments ({attachments.length})
          </h3>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 border rounded text-sm"
              >
                <span>📎</span>
                <span>{attachment.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Section */}
      <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50 text-center">
        <p className="text-sm text-green-700 mb-3">
          Requisition #:{" "}
          <span className="font-mono font-bold">
            {finalFormData.requisitionNumber}
          </span>
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
