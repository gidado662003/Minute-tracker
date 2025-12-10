"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequisitionFormProps {
  formData: any;
  onChange: (data: any) => void;
  onNext: () => void;
}

export function RequisitionForm({
  formData,
  onChange,
  onNext,
}: RequisitionFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  const categories = [
    { value: "expenses", label: "Expenses" },
    { value: "procurement", label: "Procurement" },
    { value: "refunds", label: "Refunds" },
  ];
  // (formatDate helper removed) The parent provides a controlled `requestedOn` value

  return (
    <Card>
      <CardHeader>
        <CardTitle className="w-full">
          <div className="flex justify-between items-center">
            <p>Basic Information</p>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestedOn">Date</Label>
                  <Input
                    id="requestedOn"
                    type="date"
                    value={formData.requestedOn}
                    onChange={(e) =>
                      handleChange("requestedOn", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </CardTitle>
        <CardDescription>
          Provide the basic details for your requisition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Request Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Office Supplies"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* <div className="space-y-2">
          <Label htmlFor="purpose">Purpose / Justification </Label>
          <Textarea
            id="purpose"
            placeholder="Explain why this requisition is needed..."
            rows={4}
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
          />
        </div> */}

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={
              !formData.title || !formData.priority || !formData.category
            }
          >
            Next: Add Items
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
