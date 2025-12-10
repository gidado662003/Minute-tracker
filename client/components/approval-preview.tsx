"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Paperclip } from "lucide-react";
import { useState } from "react";
import { createInternalRequisition, spreedsheetHook } from "@/app/api";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import AttachmentsSection from "./attachments-section";

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  uploadedAt: string;
}

interface ApprovalPreviewProps {
  formData: any;
  items: any[];
  attachments: Attachment[];
  totalAmount: number;
  accountToPay: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  onBack: () => void;
  onSubmit: (finalFormData: any) => void;
}

export function ApprovalPreview({
  formData,
  items,
  attachments,
  totalAmount,
  accountToPay,
  onBack,
  onSubmit,
}: ApprovalPreviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localAttachments, setLocalAttachments] =
    useState<Attachment[]>(attachments);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] =
    useState(false);
  const router = useRouter();

  const finalFormData = {
    ...formData,
    items: items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    })),
    attachments: localAttachments,
    totalAmount: totalAmount,
    accountToPay,
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

  const handleSubmitWithConfirmation = () => {
    if (localAttachments.length === 0) {
      // Show confirmation dialog if no attachments
      setIsConfirmationDialogOpen(true);
    } else {
      // Proceed directly if attachments exist
      handleSubmit();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const toCapital = (text: string) => {
    if (!text) return "";
    const name = text;
    const capitalized =
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return capitalized;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Request</h2>
        <p className="text-gray-600">Check everything before submitting</p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">
          Request Information
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-500">Title</span>
            <p className="font-medium">{toCapital(formData.title)}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Category</span>
            <p>
              <Badge variant="outline" className="capitalize">
                {formData.category}
              </Badge>
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Priority</span>
            <p>
              <Badge variant="outline" className="capitalize">
                {formData.priority}
              </Badge>
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Requested On</span>
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

      {/* Payment Details */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg border-b pb-2">Payment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500">Account Name</span>
            <p className="font-medium break-words">
              {toCapital(accountToPay.accountName) || "—"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Account Number</span>
            <p className="font-medium break-words">
              {accountToPay.accountNumber || "—"}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Bank Name</span>
            <p className="font-medium break-words">
              {toCapital(accountToPay.bankName) || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Items</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-medium text-sm text-gray-700">
                  S/N
                </th>
                <th className="text-left p-3 font-medium text-sm text-gray-700">
                  Description
                </th>

                <th className="text-left p-3 font-medium text-sm text-gray-700">
                  Quantity
                </th>
                <th className="text-left p-3 font-medium text-sm text-gray-700">
                  Unit Price
                </th>
                <th className="text-right p-3 font-medium text-sm text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.description}
                      </p>
                      {item.unit && (
                        <p className="text-xs text-gray-500 mt-1">
                          Unit: {item.unit}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-sm text-gray-600">{item.quantity}</td>
                  <td className="p-3 text-sm text-gray-600">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="p-3 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t">
                <td
                  colSpan={5}
                  className="p-3 text-lg font-bold text-gray-900 text-right"
                >
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg border-b pb-2">
            Attachments ({localAttachments.length})
          </h3>
          <AlertDialog
            open={isAttachmentDialogOpen}
            onOpenChange={setIsAttachmentDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attachments
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
              <AlertDialogHeader>
                <AlertDialogTitle>Manage Attachments</AlertDialogTitle>
                <AlertDialogDescription>
                  Add or remove supporting documents for this requisition
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="overflow-y-auto max-h-[60vh]">
                <AttachmentsSection
                  attachments={localAttachments}
                  onChange={setLocalAttachments}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Done</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Attachments List Preview */}
        {localAttachments.length > 0 ? (
          <div className="space-y-2">
            {localAttachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border rounded text-sm"
              >
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{attachment.name}</span>
                  <span className="text-gray-500 text-xs">
                    ({formatFileSize(attachment.size)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 border-2 border-dashed rounded-lg text-gray-500">
            No attachments added yet
          </div>
        )}
      </div>

      {/* Submit Section */}
      <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50 text-center">
        <p className="text-sm text-green-700 mb-3">
          Requisition will be submitted for approval. You can track its status
          in the Requisition List.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            Back
          </Button>

          <AlertDialog
            open={isConfirmationDialogOpen}
            onOpenChange={setIsConfirmationDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                onClick={handleSubmitWithConfirmation}
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
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Attachment Attention</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to continue without any attachments?
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <Button
                  onClick={() => {
                    setIsConfirmationDialogOpen(false);
                    handleSubmit();
                  }}
                >
                  Yes, Continue
                </Button>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
