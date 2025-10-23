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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface RequisitionItemsProps {
  items: any[];
  onChange: (items: any[]) => void;
  onBack: () => void;
  onNext: () => void;
}

export function RequisitionItems({
  items,
  onChange,
  onBack,
  onNext,
}: RequisitionItemsProps) {
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: 1,
    unitPrice: 0,
    unit: "pcs",
    category: "",
  });

  const categories = [
    "Personal Items",
    "Office Supplies",
    "IT Equipment",
    "Services",
    "Other",
  ];

  const units = ["pcs", "set", "kg"];

  const addItem = () => {
    if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice < 0)
      return;

    const item = {
      ...newItem,
      id: Date.now().toString(),
      total: newItem.quantity * newItem.unitPrice,
    };

    onChange([...items, item]);
    setNewItem({
      description: "",
      quantity: 1,
      unitPrice: 0,
      unit: "pcs",
      category: "",
    });
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items & Pricing</CardTitle>
        <CardDescription>Add the items you need to requisition</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Item Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
          <div className="md:col-span-4">
            <Label htmlFor="description">Item Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Laptop, Printer, etc."
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={newItem.category}
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="quantity">Qty</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  quantity: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="unit">Unit</Label>
            <select
              id="unit"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="unitPrice">Unit Price (₦)</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={newItem.unitPrice}
              onChange={(e) =>
                setNewItem({
                  ...newItem,
                  unitPrice: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button onClick={addItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        {/* Items Table */}
        {items.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.description}
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.unitPrice === 0 ? (
                        <span className="text-muted-foreground">Unknown</span>
                      ) : (
                        <span>₦ {item.unitPrice.toLocaleString()}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.total === 0 ? (
                        <span className="text-muted-foreground">Unknown</span>
                      ) : (
                        <span>₦ {item.total.toLocaleString()}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="p-4 border-t bg-muted/50">
              <div className="flex justify-between items-center">
                <div className="text-lg font-semibold">
                  {/* Total Amount: ₦{totalAmount.toLocaleString()} */}
                  <span className="text-lg font-semibold">
                    {" "}
                    Total Amount:{" "}
                    {totalAmount === 0 ? (
                      <span className="text-muted-foreground">Unknown</span>
                    ) : (
                      <span>₦ {totalAmount.toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {items.length} item(s)
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No items added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add items using the form above
            </p>
          </div>
        )}
        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext} disabled={items.length === 0}>
            Next: Attachments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
