"use client";
import { useEffect, useState } from "react";
import {
  getInternalRequisitions,
  updateInternalRequisitionStatus,
} from "@/app/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Calendar,
  Building,
  Target,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Printer,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";
import RequisitionPreview from "@/components/requisition-preview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type InternalRequisition = {
  _id: string;
  title: string;
  department: string;
  priority: string;
  neededBy: string;
  purpose: string;
  requisitionNumber: string;
  status: string;
  totalAmount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    category: string;
    total: number;
  }>;
  createdAt: string;
  approvedOn?: string;
  // optional extended fields used in PDF/template
  requestedBy?: string;
  payeeName?: string;
  bankName?: string;
  accountNumber?: string;
  vatAmount?: number;
  whtAmount?: number;
  preparedByName?: string;
  preparedOn?: string;
  deptHeadApprovedOn?: string;
  accountsVerifiedOn?: string;
  managingDirectorApprovedOn?: string;
  remarks?: string;
};

export default function AllInternalRequisitionPage() {
  const [requisitions, setRequisitions] = useState<InternalRequisition[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [printLoading, setPrintLoading] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  // status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<InternalRequisition | null>(
    null
  );
  const [selectedAction, setSelectedAction] = useState<
    "approved" | "rejected" | null
  >(null);
  const [statusComment, setStatusComment] = useState<string>("");

  useEffect(() => {
    getInternalRequisitions().then((data) => setRequisitions(data));
  }, []);

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

  // Get unique values for filters
  const departments = [...new Set(requisitions.map((req) => req.department))];
  const priorities = [...new Set(requisitions.map((req) => req.priority))];
  const statuses = [...new Set(requisitions.map((req) => req.status))];

  // Filter requisitions
  const filteredRequisitions = requisitions.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requisitionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter.length === 0 ||
      departmentFilter.includes(req.department);
    const matchesPriority =
      priorityFilter.length === 0 || priorityFilter.includes(req.priority);
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(req.status);

    return (
      matchesSearch && matchesDepartment && matchesPriority && matchesStatus
    );
  });

  const formatDate = (dateString: string) => {
    if (dateString == null) return;
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

  const toggleFilter = (
    filter: string[],
    setFilter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setFilter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter([]);
    setPriorityFilter([]);
    setStatusFilter([]);
  };

  const hasFilters =
    searchTerm ||
    departmentFilter.length > 0 ||
    priorityFilter.length > 0 ||
    statusFilter.length > 0;

  // Calculate stats
  const stats = {
    total: requisitions.length,
    pending: requisitions.filter((req) => req.status === "pending").length,
    approved: requisitions.filter((req) => req.status === "approved").length,
  };

  async function updateStatus(id: string, status: string, comment?: string) {
    if (updatingId === id) return;
    setUpdatingId(id);
    try {
      const updatedDoc = await updateInternalRequisitionStatus(
        id,
        status,
        comment
      );
      // updatedDoc should be the updated requisition document
      if (updatedDoc && updatedDoc._id) {
        setRequisitions((prev) =>
          prev.map((r) => (r._id === id ? updatedDoc : r))
        );
      } else {
        // fallback: update status locally
        setRequisitions((prev) =>
          prev.map((req) => (req._id === id ? { ...req, status } : req))
        );
      }
    } catch (error) {
      console.error("Error updating requisition status:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  // Generate PDF content as HTML element
  const generatePDFContent = (req: InternalRequisition): HTMLElement => {
    const itemsHtml = (req.items || [])
      .map(
        (item, index) => `
        <tr>
          <td style="padding:12px;border:1px solid #ddd;text-align:center">${
            index + 1
          }</td>
          <td style="padding:12px;border:1px solid #ddd">${
            item.description
          }</td>
          <td style="padding:12px;border:1px solid #ddd;text-align:center">${
            item.quantity
          }</td>
          <td style="padding:12px;border:1px solid #ddd;text-align:center">${
            item.unit
          }</td>
          <td style="padding:12px;border:1px solid #ddd;text-align:right">${formatCurrency(
            item.unitPrice
          )}</td>
          <td style="padding:12px;border:1px solid #ddd;text-align:right">${formatCurrency(
            item.total ?? item.quantity * item.unitPrice
          )}</td>
        </tr>`
      )
      .join("");

    const container = document.createElement("div");
    container.style.width = "210mm";
    container.style.minHeight = "297mm";
    container.style.padding = "20px";
    container.style.fontFamily =
      "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    container.style.lineHeight = "1.6";
    container.style.color = "#333";
    container.style.background = "#fff";

    container.innerHTML = `
    <div class="requisition-root">
      <style>
        .requisition-root{font-family: Arial, Helvetica, sans-serif; font-size:11px; color:#1e293b; margin:0 auto; padding:16px; max-width:750px;}
        .req-header{text-align:center;margin-bottom:12px}
        .req-title{font-size:15px;margin:0}
        .req-sub{font-size:12px;margin:4px 0 0}
        .section{border:1px solid #000;padding:8px;margin-bottom:12px}
        .section-title{font-size:12px;font-weight:600;margin:0 0 8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb}
        table{width:100%;border-collapse:collapse;font-size:11px}
        th,td{padding:8px;border:1px solid #e6e6e6;vertical-align:top}
        .label{font-weight:600;width:18%}
        .value{width:32%}
        .two-col{display:flex;gap:12px}
        .items-table th{text-align:left;background:#f8fafc}
        .right{text-align:right}
        .nowrap{white-space:nowrap}
        /* Print helpers */
        @media print{.requisition-root{max-width:100%}}
        .no-break{page-break-inside:avoid;break-inside:avoid}
      </style>

      <div class="req-header">
        <h1 class="req-title">PAYMENT REQUISITION FORM</h1>
        <div class="req-sub">SYSCODES COMMUNICATIONS — 9 Toyin street Ikeja</div>
      </div>

      <div class="section no-break">
        <div class="section-title">Section 1: Request Details</div>
        <table>
          <tr>
            <td class="label">Date</td>
            <td class="value">${formatDate(req.createdAt)}</td>
            <td class="label">Requisition No</td>
            <td class="value nowrap">${req.requisitionNumber}</td>
          </tr>
          <tr>
            <td class="label">Department</td>
            <td class="value">${req.department}</td>
            <td class="label">Requested By</td>
            <td class="value">${req.requestedBy || "________________"}</td>
          </tr>
          <tr>
            <td class="label">Payee / Vendor</td>
            <td class="value" colspan="3">${
              req.payeeName || "________________"
            }</td>
          </tr>
          <tr>
            <td class="label">Purpose / Description</td>
            <td class="value" colspan="3">${req.purpose || req.title}</td>
          </tr>
        </table>
      </div>

      <div class="section no-break">
        <div class="section-title">Section 2: Financial Details</div>
        <table>
          <tr>
            <td class="label">Amount</td>
            <td class="value right">${formatCurrency(req.totalAmount)}</td>
            <td class="label">Payment Type</td>
            <td class="value">[ ] Cash &nbsp; [ ] Cheque &nbsp; [ ] Transfer</td>
          </tr>
          <tr>
            <td class="label">Bank Name</td>
            <td class="value">${req.bankName || "________________"}</td>
            <td class="label">Account Number</td>
            <td class="value">${req.accountNumber || "________________"}</td>
          </tr>
       
        </table>
      </div>

      <!-- Items table -->
      <div class="section no-break">
        <div class="section-title">Items / Line Details</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width:6%">#</th>
              <th style="width:46%">Description</th>
              <th style="width:12%">Qty</th>
              <th style="width:12%">Unit</th>
              <th style="width:12%" class="right">Unit Price</th>
              <th style="width:12%" class="right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5" class="right" style="font-weight:600">Total</td>
              <td class="right" style="font-weight:600">${formatCurrency(
                req.totalAmount
              )}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="section no-break">
        <div class="section-title">Section 3: Approvals</div>
        <table>
          <tr>
            <td class="label">Prepared By (Name/Signature)</td>
            <td class="value">${req.preparedByName || "________________"}</td>
            <td class="label">Date</td>
            <td class="value">${formatDate(req.approvedOn)}</td>
          </tr>
          <tr>
            <td class="label">Department Head Approval</td>
            <td class="value">${
              req.deptHeadApprovedOn ? formatDate(req.deptHeadApprovedOn) : ""
            }</td>
           
          </tr>
          <tr>
            <td class="label">Managing Director Approval</td>
            <td class="value">${
              req.managingDirectorApprovedOn
                ? formatDate(req.managingDirectorApprovedOn)
                : ""
            }</td>
            <td class="label"></td>
            <td class="value"></td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Section 4: Notes / Remarks</div>
        <div style="min-height:40px">${req.comment || ""}</div>
      </div>
    </div>
    `;

    return container;
  };

  // Auto-download PDF function
  const downloadAsPDF = async (req: InternalRequisition) => {
    setPdfLoading(req._id);
    try {
      // Create PDF content element
      const pdfElement = generatePDFContent(req);
      document.body.appendChild(pdfElement);

      // Convert to canvas then to PDF
      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: pdfElement.scrollWidth,
        height: pdfElement.scrollHeight,
      });

      // Remove the temporary element
      document.body.removeChild(pdfElement);

      const imgData = canvas.toDataURL("image/png");

      // Calculate PDF dimensions
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Auto-download the PDF
      pdf.save(`requisition-${req.requisitionNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Unable to generate PDF. Please try again.");
    } finally {
      setPdfLoading(null);
    }
  };

  // Print function (unchanged)
  const printRequisition = async (req: InternalRequisition) => {
    setPrintLoading(req._id);
    try {
      const pdfElement = generatePDFContent(req);
      const printWindow = window.open("", "_blank", "width=1000,height=800");
      if (!printWindow) {
        alert("Please allow popups for this site to print requisitions.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Requisition ${req.requisitionNumber}</title>
            <style>
              @media print {
                body { margin: 0; padding: 0; }
                @page { margin: 20mm; }
              }
            </style>
          </head>
          <body>
            ${pdfElement.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setPrintLoading(null);
        }, 500);
      };
    } catch (error) {
      console.error("Error printing requisition:", error);
      alert("Unable to print requisition");
      setPrintLoading(null);
    }
  };

  // Bulk actions (unchanged)
  const handleBulkPrint = () => {
    if (filteredRequisitions.length === 0) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bulk Requisitions Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .requisition { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; }
          .header { background: #f5f5f5; padding: 10px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f0f0f0; }
        </style>
      </head>
      <body>
        <h1>Bulk Requisitions Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>Total Requisitions: ${filteredRequisitions.length}</p>
        ${filteredRequisitions
          .map(
            (req) => `
          <div class="requisition">
            <div class="header">
              <h2>${req.requisitionNumber} - ${req.title}</h2>
              <p>Department: ${req.department} | Status: ${
              req.status
            } | Total: ${formatCurrency(req.totalAmount)}</p>
            </div>
            <p><strong>Purpose:</strong> ${req.purpose}</p>
          </div>
        `
          )
          .join("")}
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Status confirmation dialog with comment */}
      <AlertDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) {
            setSelectedReq(null);
            setSelectedAction(null);
            setStatusComment("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAction === "approved"
                ? "Approve Requisition"
                : "Reject Requisition"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Please provide a comment for this action (optional). It will be
            saved with the requisition.
          </AlertDialogDescription>

          <div className="mt-4">
            <textarea
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              placeholder="Add a note or reason for this approval/rejection"
              className="w-full border rounded p-2 h-24"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!selectedReq || !selectedAction) return;
                await updateStatus(
                  selectedReq._id,
                  selectedAction,
                  statusComment
                );
                setStatusDialogOpen(false);
              }}
              disabled={!!updatingId}
            >
              {selectedAction === "approved" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Internal Requisitions
          </h1>
          <p className="text-gray-600">
            Manage and track all requisition requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requisitions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.approved}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>All Request</CardTitle>
                <p className="text-gray-600">
                  {filteredRequisitions.length} of {requisitions.length}{" "}
                  requests
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Bulk Actions */}
                {filteredRequisitions.length > 0 && (
                  <Select
                    onValueChange={(value) => {
                      if (value === "print") handleBulkPrint();
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Bulk Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="print">Print All</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search requisitions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                {/* Department Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Building className="h-4 w-4" />
                      Department
                      {departmentFilter.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {departmentFilter.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {departments.map((dept) => (
                      <DropdownMenuCheckboxItem
                        key={dept}
                        checked={departmentFilter.includes(dept)}
                        onCheckedChange={() =>
                          toggleFilter(
                            departmentFilter,
                            setDepartmentFilter,
                            dept
                          )
                        }
                      >
                        {dept}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Priority Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Target className="h-4 w-4" />
                      Priority
                      {priorityFilter.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {priorityFilter.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {priorities.map((priority) => (
                      <DropdownMenuCheckboxItem
                        key={priority}
                        checked={priorityFilter.includes(priority)}
                        onCheckedChange={() =>
                          toggleFilter(
                            priorityFilter,
                            setPriorityFilter,
                            priority
                          )
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span>{getPriorityIcon(priority)}</span>
                          <span className="capitalize">{priority}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {hasFilters && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requisition #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead>Aproved On</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredRequisitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-32">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Search className="h-8 w-8 mb-2 text-gray-300" />
                          <p>No requisitions found</p>
                          <p className="text-sm">
                            {hasFilters
                              ? "Try adjusting your filters"
                              : "No requisitions available yet"}
                          </p>
                          {hasFilters && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearFilters}
                              className="mt-2"
                            >
                              Clear Filters
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequisitions.map((req, index) => (
                      <motion.tr
                        key={req._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-mono text-sm text-blue-600">
                          {req.requisitionNumber}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium capitalize">
                            {req.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{req.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPriorityColor(req.priority)}
                            className="capitalize"
                          >
                            {getPriorityIcon(req.priority)} {req.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusColor(req.status)}
                            className="capitalize"
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(req.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            {formatDate(req.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />

                            {req.status === "rejected"
                              ? "Not approved"
                              : req.approvedOn
                              ? formatDate(req.approvedOn)
                              : "Pending"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Requisition Details -{" "}
                                    {req.requisitionNumber}
                                  </AlertDialogTitle>
                                </AlertDialogHeader>
                                <RequisitionPreview data={req} />
                                <AlertDialogFooter className="flex gap-2">
                                  <Button
                                    onClick={() => downloadAsPDF(req)}
                                    disabled={pdfLoading === req._id}
                                    className="flex items-center gap-2"
                                  >
                                    <Download className="h-4 w-4" />
                                    {pdfLoading === req._id
                                      ? "Generating..."
                                      : "PDF"}
                                  </Button>
                                  <Button
                                    onClick={() => printRequisition(req)}
                                    disabled={printLoading === req._id}
                                    className="flex items-center gap-2"
                                  >
                                    <Printer className="h-4 w-4" />
                                    {printLoading === req._id
                                      ? "Printing..."
                                      : "Print"}
                                  </Button>
                                  <AlertDialogCancel>Close</AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            {req.status === "pending" ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReq(req);
                                    setSelectedAction("approved");
                                    setStatusComment("");
                                    setStatusDialogOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 text-green-600"
                                  disabled={!!updatingId}
                                >
                                  {updatingId === req._id ? (
                                    <span className="text-xs">...</span>
                                  ) : (
                                    <ThumbsUp className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReq(req);
                                    setSelectedAction("rejected");
                                    setStatusComment("");
                                    setStatusDialogOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 text-red-600"
                                  disabled={!!updatingId}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => printRequisition(req)}
                                  disabled={printLoading === req._id}
                                >
                                  {printLoading === req._id ? (
                                    <span className="text-xs">...</span>
                                  ) : (
                                    <Printer className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => downloadAsPDF(req)}
                                  disabled={pdfLoading === req._id}
                                >
                                  {pdfLoading === req._id ? (
                                    <span className="text-xs">...</span>
                                  ) : (
                                    <Download className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
