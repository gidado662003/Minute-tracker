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
import AttachmentsSection from "@/components/attachments-section"; // Fixed import
import { ApprovalPreview } from "@/components/approval-preview";

export default function CreateInternalRequisitionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    priority: "medium",
    requestedOn: new Date().toISOString().slice(0, 10),
    purpose: "",
  });
  const [items, setItems] = useState([]);
  const [attachments, setAttachments] = useState([]); // This should be passed to ApprovalPreview
  const [accountToPay, setAccountToPay] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
  });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleSubmit = async (finalFormData: any) => {
    // Here you would typically send data to your API
    console.log("Submitting requisition:", finalFormData);

    // Simulate API call
    try {
      // await fetch('/api/requisitions', { method: 'POST', body: JSON.stringify(finalFormData) });
      alert("Requisition submitted successfully!");
      router.push("/internal-requisitions/requisition-list");
    } catch (error) {
      alert("Error submitting requisition");
    }
  };

  const steps = [
    { number: 1, title: "Basic Information" },
    { number: 2, title: "Descriptions & Payment" },
    { number: 3, title: "Review & Submit" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create Request
            </h1>
            <p className="text-muted-foreground">
              Fill in the details below to create a new internal requisition
            </p>
          </div>
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
        <div
          className={`${
            currentStep === 3 ? "lg:col-span-3" : "lg:col-span-3"
          } space-y-6`}
        >
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
              accountToPay={accountToPay}
              onAccountToPayChange={setAccountToPay}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <ApprovalPreview
              formData={formData}
              items={items}
              attachments={attachments} // Pass attachments from parent
              totalAmount={totalAmount}
              accountToPay={accountToPay}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
