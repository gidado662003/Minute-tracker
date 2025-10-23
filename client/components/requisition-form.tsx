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

  const departments = [
    "IT",
    "Finance",
    "HR",
    "Operations",
    "Marketing",
    "Sales",
    "Procurement",
  ];

  const priorities = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Provide the basic details for your requisition
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Requisition Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Office Supplies"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => handleChange("department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neededBy">Needed By</Label>
            <Input
              id="neededBy"
              type="date"
              value={formData.neededBy}
              onChange={(e) => handleChange("neededBy", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose / Justification *</Label>
          <Textarea
            id="purpose"
            placeholder="Explain why this requisition is needed..."
            rows={4}
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            disabled={
              !formData.title || !formData.department || !formData.purpose
            }
          >
            Next: Add Items
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
