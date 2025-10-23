"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { createInternalRequisition } from "@/app/api";

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
  // Create finalFormData with all combined data
  const router = useRouter();
  const finalFormData = {
    ...formData,
    items: items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    })),
    attachments: attachments,
    totalAmount: totalAmount,
    requisitionNumber: `REQ-${new Date().getTime().toString().slice(-5)}`,
    status: "pending",
  };
  console.log(finalFormData);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const handleSubmit = () => {
    createInternalRequisition(finalFormData);
    onSubmit(finalFormData);
    router.push("/internal-requisitions/requisition-list");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          Review & Submit
        </CardTitle>
        <CardDescription>
          Please review all information before submitting your requisition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information Review */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Title
              </label>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Department
              </label>
              <p className="font-medium">{formData.department}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Priority
              </label>
              <Badge
                variant={getPriorityColor(formData.priority)}
                className="capitalize"
              >
                {formData.priority}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Needed By
              </label>
              <p className="font-medium">
                {formData.neededBy || "Not specified"}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Purpose
              </label>
              <p className="font-medium">{formData.purpose}</p>
            </div>
          </CardContent>
        </Card>

        {/* Items Review */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{item.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} ×{" "}
                      {item.unitPrice === 0 ? (
                        <span className="text-muted-foreground">Unknown</span>
                      ) : (
                        <span>₦ {item.unitPrice.toLocaleString()}</span>
                      )}
                      {item.category && ` • ${item.category}`}
                    </div>
                  </div>
                  <div className="font-medium">
                    {item.total === 0 ? (
                      <span className="text-muted-foreground">Unknown</span>
                    ) : (
                      <span>₦ {item.total.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                <div>Total Amount</div>
                <div>
                  {totalAmount === 0 ? (
                    <span className="text-muted-foreground">Unknown</span>
                  ) : (
                    <span>₦ {totalAmount.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attachments Review */}
        {attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Attachments ({attachments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{attachment.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submission */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold">Ready to Submit</h3>
              <p className="text-sm text-muted-foreground">
                Your requisition will be sent for approval. You can track its
                progress in the requisitions list.
              </p>
              <div className="flex justify-center gap-4 pt-2">
                <Button variant="outline" onClick={onBack}>
                  Back to Edit
                </Button>
                <Button onClick={handleSubmit} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Submit Requisition
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
