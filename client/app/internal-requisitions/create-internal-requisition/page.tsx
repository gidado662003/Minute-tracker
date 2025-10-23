"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FileText, Upload } from "lucide-react";
import Link from "next/link";
import { RequisitionForm } from "@/components/requisition-form";
import { RequisitionItems } from "@/components/requisition-items";
import { AttachmentsSection } from "@/components/attachments-section";
import { ApprovalPreview } from "@/components/approval-preview";

export default function CreateInternalRequisitionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    priority: "medium",
    neededBy: "",
    purpose: "",
  });
  const [items, setItems] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleSubmit = async () => {
    // Here you would typically send data to your API
    const requisitionData = {
      ...formData,
      items,
      attachments,
      totalAmount,
      status: "pending",
      requisitionNumber: `REQ-${Date.now()}`,
    };

    // Simulate API call
    try {
      // await fetch('/api/requisitions', { method: 'POST', body: JSON.stringify(requisitionData) });
      alert("Requisition submitted successfully!");
    } catch (error) {
      alert("Error submitting requisition");
    }
  };

  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Items & Pricing" },
    { number: 3, title: "Attachments" },
    { number: 4, title: "Review & Submit" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internal-requisitions">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Internal Requisition
            </h1>
            <p className="text-muted-foreground">
              Fill in the details below to create a new internal requisition
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            ₦{totalAmount.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Amount</div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    currentStep >= step.number
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && (
            <RequisitionForm
              formData={formData}
              onChange={setFormData}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <RequisitionItems
              items={items}
              onChange={setItems}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <AttachmentsSection
              attachments={attachments}
              onChange={setAttachments}
              onBack={() => setCurrentStep(2)}
              onNext={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 4 && (
            <ApprovalPreview
              formData={formData}
              items={items}
              attachments={attachments}
              totalAmount={totalAmount}
              onBack={() => setCurrentStep(3)}
              onSubmit={handleSubmit}
            />
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Requisition Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Title</div>
                <div className="font-medium">
                  {formData.title || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Department</div>
                <div className="font-medium">
                  {formData.department || "Not specified"}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Priority</div>
                <div className="font-medium capitalize">
                  {formData.priority}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Items</div>
                <div className="font-medium">{items.length} items</div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  Total Amount
                </div>
                <div className="text-2xl font-bold text-primary">
                  ₦{totalAmount.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/internal-requisitions/requisition-list">
                  View All Requisitions
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Save as Draft
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Import from Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
