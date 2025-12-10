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
import { useState, useEffect } from "react";

interface RequisitionItemsProps {
  items: any[];
  onChange: (items: any[]) => void;
  accountToPay: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  onAccountToPayChange: (v: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  }) => void;
  onBack: () => void;
  onNext: () => void;
}

export function RequisitionItems({
  items,
  onChange,
  accountToPay,
  onAccountToPayChange,
  onBack,
  onNext,
}: RequisitionItemsProps) {
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: "",
    unitPrice: "",
  });

  useEffect(() => {
    document
      .getElementById("requisition-items")
      ?.scrollIntoView({ behavior: "smooth" });
  }, [items]);
  const addItem = () => {
    if (!newItem.description.trim()) return;

    const quantity = parseFloat(newItem.quantity) || 0;
    const unitPrice = parseFloat(newItem.unitPrice) || 0;
    const total = quantity * unitPrice;

    const item = {
      description: newItem.description,
      quantity: quantity,
      unitPrice: unitPrice,
      id: Date.now().toString(),
      total: total,
    };

    onChange([...items, item]);
    setNewItem({
      description: "",
      quantity: "",
      unitPrice: "",
    });
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<any>) => {
    const next = items.map((it) => {
      if (it.id !== id) return it;
      const merged = { ...it, ...updates } as any;

      // Handle quantity and unitPrice as strings for empty values
      const qty =
        typeof merged.quantity === "string"
          ? parseFloat(merged.quantity) || 0
          : merged.quantity;
      const price =
        typeof merged.unitPrice === "string"
          ? parseFloat(merged.unitPrice) || 0
          : merged.unitPrice;

      merged.total = qty * price;
      return merged;
    });
    onChange(next);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const accountValid =
    Boolean(accountToPay.accountName?.trim()) &&
    Boolean(accountToPay.accountNumber?.trim()) &&
    Boolean(accountToPay.bankName?.trim());

  // Calculate preview total for new item
  const newItemQuantity = parseFloat(newItem.quantity) || 0;
  const newItemUnitPrice = parseFloat(newItem.unitPrice) || 0;
  const newItemTotal = newItemQuantity * newItemUnitPrice;

  return (
    <Card id="requisition-items">
      <CardHeader>
        <CardTitle>Descriptions</CardTitle>
        <CardDescription>
          Add items and payment details for the request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Items Table */}
        <div className="border rounded-lg">
          {/* <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
            <h3 className="font-semibold"></h3>
            <Button onClick={addItem} disabled={!newItem.description.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Description
            </Button>
          </div> */}

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 border border-slate-200/80 shadow-sm font-semibold text-slate-800">
                <TableCell className="font-semibold text-slate-800">
                  New
                </TableCell>
                <TableCell className="border-l border-slate-200/80">
                  <Input
                    placeholder="Enter description..."
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="border-l border-slate-200/80">
                  <Input
                    type="number"
                    placeholder="0"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: e.target.value,
                      })
                    }
                  />
                </TableCell>
                <TableCell className="border-l border-slate-200/80">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.unitPrice}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        unitPrice: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="font-semibold text-slate-800 border-l border-slate-200/80">
                  {newItem.quantity && newItem.unitPrice ? (
                    `₦ ${newItemTotal.toLocaleString()}`
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Qty</TableHead>
                <TableHead className="w-[150px]">Unit Price (₦)</TableHead>
                <TableHead className="w-[150px]">Total (₦)</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* New Item Row */}
              {/* <TableRow className="bg-muted/30">
                <TableCell className="font-medium">New</TableCell>
                <TableCell>
                  <Input
                    placeholder="Enter description..."
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: e.target.value,
                      })
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.unitPrice}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        unitPrice: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {newItem.quantity && newItem.unitPrice ? (
                    `₦ ${newItemTotal.toLocaleString()}`
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell></TableCell>
              </TableRow> */}

              {/* Existing Items */}
              {items.map((item, ind) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{ind + 1}</TableCell>
                  <TableCell>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, { description: e.target.value })
                      }
                      placeholder="Description"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, {
                          quantity: e.target.value,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(item.id, {
                          unitPrice: e.target.value,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.quantity && item.unitPrice ? (
                      `₦ ${item.total.toLocaleString()}`
                    ) : (
                      <span className="text-muted-foreground">-</span>
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

          {/* Total Amount */}
          {items.length > 0 && (
            <div className="p-4 border-t bg-muted/50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground"></div>
                <div className="text-lg font-semibold">
                  Total Amount: ₦ {totalAmount.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No items added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Use the form above to add your first item
            </p>
          </div>
        )}

        {/* Account To Pay Section */}
        <div className="border rounded-lg">
          <div className="p-4 border-b bg-muted/50">
            <h3 className="font-semibold">Payment Details</h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="John Doe Enterprises"
                value={accountToPay.accountName}
                onChange={(e) =>
                  onAccountToPayChange({
                    ...accountToPay,
                    accountName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="0123456789"
                maxLength={10}
                value={accountToPay.accountNumber}
                onChange={(e) =>
                  onAccountToPayChange({
                    ...accountToPay,
                    accountNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="First Bank"
                value={accountToPay.bankName}
                onChange={(e) =>
                  onAccountToPayChange({
                    ...accountToPay,
                    bankName: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={items.length === 0 || !accountValid}
          >
            Next: Submission
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
