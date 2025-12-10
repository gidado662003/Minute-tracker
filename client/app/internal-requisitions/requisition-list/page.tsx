"use client";
import { useEffect, useState } from "react";
import {
  getInternalRequisitions,
  getMe,
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
  X,
  MoreVertical,
  Paperclip,
  Calendar,
  User,
  BanknoteIcon,
  Tag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

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
  category?: string;
  attachments: string[];
  user?: {
    name: string;
    email: string;
    department: string;
    role: string;
  };
  accountToPay?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
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
  comment?: string;
  approvedByHeadOfDepartment?: boolean;
  approvedByFinance?: {
    name: string;
    email: string;
    department: string;
    role: string;
  } | null;
  requestedBy?: string;
  payeeName?: string; // legacy fallback
  bankName?: string; // legacy fallback
  accountNumber?: string; // legacy fallback
  vatAmount?: number;
  whtAmount?: number;
  preparedByName?: string;
  preparedOn?: string;
  accountsVerifiedOn?: string;
  managingDirectorApprovedOn?: string;
  remarks?: string;
};

export default function AllInternalRequisitionPage() {
  const [requisitions, setRequisitions] = useState<InternalRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [printLoading, setPrintLoading] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const { showToast } = useToast();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<InternalRequisition | null>(
    null
  );
  const [selectedAction, setSelectedAction] = useState<
    "approved" | "rejected" | null
  >(null);
  const [statusComment, setStatusComment] = useState<string>("");
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const fetchMe = async () => {
      const data = await getMe();
      setMe(data);
    };
    fetchMe();
  }, []);

  useEffect(() => {
    loadRequisitions();
  }, []);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const data = await getInternalRequisitions();
      setRequisitions(data);
    } catch (error) {
      console.error("Error loading requisitions:", error);
      showToast("Failed to load request", "error");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "in review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "office supplies": "bg-blue-50 text-blue-700 border-blue-200",
      equipment: "bg-purple-50 text-purple-700 border-purple-200",
      travel: "bg-amber-50 text-amber-700 border-amber-200",
      utilities: "bg-cyan-50 text-cyan-700 border-cyan-200",
      maintenance: "bg-orange-50 text-orange-700 border-orange-200",
      software: "bg-indigo-50 text-indigo-700 border-indigo-200",
      training: "bg-emerald-50 text-emerald-700 border-emerald-200",
      marketing: "bg-pink-50 text-pink-700 border-pink-200",
      general: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      colors[category?.toLowerCase() as keyof typeof colors] || colors.general
    );
  };

  // Get unique values for filters
  const departments = [...new Set(requisitions.map((req) => req.department))];
  const priorities = [...new Set(requisitions.map((req) => req.priority))];
  const statuses = [...new Set(requisitions.map((req) => req.status))];
  const categories = [
    ...new Set(requisitions.map((req) => req.category || "General")),
  ];

  // Filter requisitions
  const filteredRequisitions = requisitions.filter((req) => {
    const matchesSearch =
      (req?.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req?.requisitionNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (req?.department || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (req?.category || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      departmentFilter.length === 0 ||
      departmentFilter.includes(req.department);
    const matchesPriority =
      priorityFilter.length === 0 || priorityFilter.includes(req.priority);
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(req.status);
    const matchesCategory =
      categoryFilter?.length === 0 ||
      categoryFilter?.includes(req.category || "General");

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesPriority &&
      matchesStatus &&
      matchesCategory
    );
  });

  const formatDate = (dateString?: string | null): string | undefined => {
    if (!dateString) return undefined;
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
    setCategoryFilter([]);
  };

  const hasFilters =
    searchTerm ||
    departmentFilter.length > 0 ||
    priorityFilter.length > 0 ||
    statusFilter.length > 0 ||
    categoryFilter.length > 0;

  // Calculate stats
  const stats = {
    total: requisitions.length,
    pending: requisitions.filter((req) => req.status === "pending").length,
    approved: requisitions.filter((req) => req.status === "approved").length,
    rejected: requisitions.filter((req) => req.status === "rejected").length,
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
      if (updatedDoc && updatedDoc._id) {
        setRequisitions((prev) =>
          prev.map((r) => (r._id === id ? updatedDoc : r))
        );
        showToast(`Requisition ${status} successfully`, "success");
      } else {
        setRequisitions((prev) =>
          prev.map((req) => (req._id === id ? { ...req, status } : req))
        );
      }
    } catch (error) {
      console.error("Error updating requisition status:", error);
      showToast("Failed to update requisition status", "error");
    } finally {
      setUpdatingId(null);
      setStatusDialogOpen(false);
      setSelectedReq(null);
      setSelectedAction(null);
      setStatusComment("");
    }
  }

  // View Details Handler
  const handleViewDetails = (requisition: InternalRequisition) => {
    setSelectedReq(requisition);
    setDetailsDialogOpen(true);
  };

  // Status Update Handler
  const handleStatusUpdate = (
    requisition: InternalRequisition,
    action: "approved" | "rejected"
  ) => {
    setSelectedReq(requisition);
    setSelectedAction(action);
    setStatusDialogOpen(true);
  };

  // Generate PDF content as HTML element
  const generatePDFContent = (req: InternalRequisition): HTMLElement => {
    const acct = req.accountToPay || ({} as any);
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
            item.unit || "Cash"
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
        <div class="req-sub">SYSCODES COMMUNICATIONS</div>
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
            <td class="value">${req.user?.name || "________________"}</td>
          </tr>
          <tr>
            <td class="label">Payee / Vendor</td>
            <td class="value" colspan="3">${
              acct.accountName || req.payeeName || "________________"
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
            <td class="value">${
              acct.bankName || req.bankName || "________________"
            }</td>
            <td class="label">Account Number</td>
            <td class="value">${
              acct.accountNumber || req.accountNumber || "________________"
            }</td>
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
            <td class="label">Finance Approval</td>
            <td class="value">${
              req.approvedOn ? formatDate(req.approvedOn) : ""
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

  // Apply safe colors to avoid html2canvas color parsing issues
  const applySafeColors = (element: HTMLElement) => {
    const safeStyles = `
      * {
        color: #333333 !important;
        background-color: #ffffff !important;
        border-color: #dddddd !important;
      }
      
      .section {
        border-color: #000000 !important;
      }
      
      .section-title {
        border-bottom-color: #e5e7eb !important;
        color: #333333 !important;
      }
      
      th {
        background-color: #f8fafc !important;
        color: #333333 !important;
      }
      
      table, th, td {
        border-color: #e6e6e6 !important;
      }
      
      .req-title {
        color: #333333 !important;
      }
      
      .req-sub {
        color: #666666 !important;
      }
      
      .label {
        color: #333333 !important;
        background-color: transparent !important;
      }
      
      .value {
        color: #333333 !important;
        background-color: transparent !important;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = safeStyles;
    element.appendChild(styleElement);
  };

  // Auto-download PDF function
  const downloadAsPDF = async (req: InternalRequisition) => {
    setPdfLoading(req._id);
    try {
      // Create PDF content element
      const pdfElement = generatePDFContent(req);

      // Apply safe colors to avoid html2canvas color parsing issues
      applySafeColors(pdfElement);

      document.body.appendChild(pdfElement);

      // Dynamically import browser-only libs at runtime to avoid build/SSR errors
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Convert to canvas then to PDF with safe configuration
      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: pdfElement.scrollWidth,
        height: pdfElement.scrollHeight,
        backgroundColor: "#ffffff", // Ensure white background
        removeContainer: true, // Clean up internal containers
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

      showToast("PDF generated successfully!", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Unable to generate PDF. Please try again.", "error");
    } finally {
      setPdfLoading(null);
    }
  };

  // Print function
  const printRequisition = async (req: InternalRequisition) => {
    setPrintLoading(req._id);
    try {
      const pdfElement = generatePDFContent(req);
      const printWindow = window.open("", "_blank", "width=1000,height=800");
      if (!printWindow) {
        alert("Please allow popups for this site to print request.");
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

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Status Confirmation Dialog */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAction === "approved"
                ? "Approve Requisition"
                : "Reject Requisition"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction === "approved"
                ? "Are you sure you want to approve this requisition? This action cannot be undone."
                : "Are you sure you want to reject this requisition? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Comment (Optional)</label>
            <Textarea
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              placeholder="Add a note or reason..."
              className="min-h-[80px]"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setStatusComment("");
                setSelectedAction(null);
                setSelectedReq(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!selectedReq || !selectedAction) return;
                await updateStatus(
                  selectedReq._id,
                  selectedAction,
                  statusComment
                );
              }}
              disabled={!!updatingId}
              className={
                selectedAction === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {updatingId
                ? "Processing..."
                : selectedAction === "approved"
                ? "Approve"
                : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5" />
              Requisition Details
            </DialogTitle>
            <DialogDescription>
              Complete information for{" "}
              <span className="font-semibold">
                {selectedReq?.requisitionNumber}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedReq && (
            <div className="space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Requisition Number
                      </label>
                      <p className="font-mono font-medium text-sm">
                        {selectedReq.requisitionNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Title
                      </label>
                      <p className="font-medium text-sm capitalize">
                        {selectedReq.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Department
                      </label>
                      <p className="text-sm">{selectedReq.department}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Priority
                      </label>
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${getPriorityColor(
                          selectedReq.priority
                        )}`}
                      >
                        {selectedReq.priority}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <Badge
                        className={`capitalize text-xs ${getStatusColor(
                          selectedReq.status
                        )}`}
                      >
                        {selectedReq.status}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Created Date
                      </label>
                      <p className="text-sm">
                        {formatDate(selectedReq.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Approval trail */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Head of Department Approval
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            selectedReq.approvedByHeadOfDepartment
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {selectedReq.approvedByHeadOfDepartment
                            ? "Approved by HoD"
                            : "Pending HoD Approval"}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Finance Approval
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            selectedReq.approvedByFinance
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {selectedReq.approvedByFinance
                            ? "Approved by Finance"
                            : "Pending Finance Approval"}
                        </Badge>
                      </div>
                      {selectedReq.approvedByFinance && (
                        <p className="mt-1 text-xs text-gray-500">
                          By {selectedReq.approvedByFinance.name} (
                          {selectedReq.approvedByFinance.email})
                        </p>
                      )}
                    </div>
                  </div>
                  {selectedReq.purpose && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Purpose
                      </label>
                      <p className="text-sm mt-1 bg-gray-50 p-3 rounded-md">
                        {selectedReq.purpose}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Financial Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg border">
                      <label className="text-xs font-medium text-gray-600">
                        Total Amount
                      </label>
                      <p className="text-lg font-bold text-green-600 mt-1">
                        {formatCurrency(selectedReq.totalAmount)}
                      </p>
                    </div>
                    {selectedReq.vatAmount && (
                      <div className="bg-blue-50 p-3 rounded-lg border">
                        <label className="text-xs font-medium text-gray-600">
                          VAT Amount
                        </label>
                        <p className="text-base font-semibold text-blue-600 mt-1">
                          {formatCurrency(selectedReq.vatAmount)}
                        </p>
                      </div>
                    )}
                    {selectedReq.whtAmount && (
                      <div className="bg-purple-50 p-3 rounded-lg border">
                        <label className="text-xs font-medium text-gray-600">
                          WHT Amount
                        </label>
                        <p className="text-base font-semibold text-purple-600 mt-1">
                          {formatCurrency(selectedReq.whtAmount)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-3">
                      Payment Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Account Name
                        </label>
                        <p className="text-sm">
                          {selectedReq.accountToPay?.accountName ||
                            selectedReq.payeeName ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Account Number
                        </label>
                        <p className="text-sm font-mono">
                          {selectedReq.accountToPay?.accountNumber ||
                            selectedReq.accountNumber ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">
                          Bank Name
                        </label>
                        <p className="text-sm">
                          {selectedReq.accountToPay?.bankName ||
                            selectedReq.bankName ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Items ({selectedReq.items.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="h-8 text-xs font-medium">
                              #
                            </TableHead>
                            <TableHead className="h-8 text-xs font-medium">
                              Description
                            </TableHead>

                            <TableHead className="h-8 text-xs font-medium text-center">
                              Qty
                            </TableHead>

                            <TableHead className="h-8 text-xs font-medium text-right">
                              Unit Price
                            </TableHead>
                            <TableHead className="h-8 text-xs font-medium text-right">
                              Total
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedReq.items.map((item, index) => (
                            <TableRow key={index} className="h-12">
                              <TableCell className="text-xs font-medium py-2">
                                {index + 1}
                              </TableCell>
                              <TableCell className="text-xs py-2 max-w-[150px] truncate">
                                {item.description}
                              </TableCell>

                              <TableCell className="text-xs text-center py-2">
                                {item.quantity}
                              </TableCell>

                              <TableCell className="text-xs text-right py-2">
                                {formatCurrency(item.total)}
                              </TableCell>
                              <TableCell className="text-xs text-right font-semibold text-green-600 py-2">
                                {formatCurrency(item.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Attachments ({selectedReq.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedReq.attachments.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {selectedReq.attachments.map(
                        (img: string, index: number) => (
                          <div key={index} className="group relative">
                            <div className="aspect-square border border-gray-200 rounded-md overflow-hidden hover:border-blue-300 transition-colors">
                              <a
                                href={`http://10.0.0.253:5000${img}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  className="w-full h-full object-cover"
                                  src={`http://10.0.0.253:5000${img}`}
                                  alt={`Attachment ${index + 1}`}
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/placeholder-image.jpg";
                                  }}
                                />
                              </a>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center truncate">
                              {index + 1}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No attachments</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comments */}
              {selectedReq.comment && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                      <p className="text-sm text-gray-700">
                        {selectedReq.comment}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            Payment Request
          </h1>
          <p className="text-gray-600">Manage and track all payment requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.approved}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.rejected}
                  </p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <X className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle>All Request</CardTitle>
                <p className="text-gray-600 text-sm">
                  {filteredRequisitions.length} of {requisitions.length}{" "}
                  requests
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search request..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Tag className="h-4 w-4" />
                        Category
                        {categoryFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {categoryFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {categories.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category}
                          checked={categoryFilter.includes(category)}
                          onCheckedChange={() =>
                            toggleFilter(
                              categoryFilter,
                              setCategoryFilter,
                              category
                            )
                          }
                          className="capitalize"
                        >
                          {category}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Target className="h-4 w-4" />
                        Status
                        {statusFilter.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {statusFilter.length}
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {statuses.map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={statusFilter.includes(status)}
                          onCheckedChange={() =>
                            toggleFilter(statusFilter, setStatusFilter, status)
                          }
                        >
                          <span className="capitalize">{status}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {hasFilters && (
                    <Button variant="ghost" onClick={clearFilters}>
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S/N</TableHead>
                  {/* <TableHead>Request #</TableHead> */}
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approvals</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center h-32">
                        <div className="flex items-center justify-center text-gray-500">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mr-2"></div>
                          Loading request...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRequisitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center h-32">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Search className="h-8 w-8 mb-2 text-gray-300" />
                          <p>No request found</p>
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-mono text-sm font-medium text-blue-600">
                          {index + 1}
                        </TableCell>
                        {/* <TableCell className="font-mono text-[12px] font-medium text-blue-600">
                          {req.requisitionNumber}
                        </TableCell> */}
                        <TableCell>
                          <div className="font-medium capitalize">
                            {req.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {req.purpose}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {req.department}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`capitalize border ${getCategoryColor(
                              req.category || "General"
                            )}`}
                          >
                            {req.category || "General"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`capitalize border ${getPriorityColor(
                              req.priority
                            )}`}
                          >
                            {req.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`capitalize border ${getStatusColor(
                              req.status
                            )}`}
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            <span
                              className={
                                req.approvedByHeadOfDepartment
                                  ? "text-green-700"
                                  : "text-yellow-700"
                              }
                            >
                              HoD:{" "}
                              {req.approvedByHeadOfDepartment
                                ? "Approved"
                                : "Pending"}
                            </span>
                            <span
                              className={
                                req.approvedByFinance
                                  ? "text-green-700"
                                  : "text-yellow-700"
                              }
                            >
                              Finance:{" "}
                              {req.approvedByFinance ? "Approved" : "Pending"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(req.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(req.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(req)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>

                              {/* Line Manager / Head of Department approval (first stage) */}
                              {req.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(req, "approved")
                                    }
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusUpdate(req, "rejected")
                                    }
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* Finance / Admin final approval (requires HoD approval) */}
                              {req.status === "in review" &&
                                me?.department?.toLowerCase() === "finance" && (
                                  <>
                                    <DropdownMenuItem
                                      disabled={!req.approvedByHeadOfDepartment}
                                      onClick={() =>
                                        handleStatusUpdate(req, "approved")
                                      }
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-2 text-green-600" />
                                      {req.approvedByHeadOfDepartment
                                        ? "Approve (Finance)"
                                        : "Awaiting Line Manager Approval"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusUpdate(req, "rejected")
                                      }
                                    >
                                      <ThumbsDown className="h-4 w-4 mr-2 text-red-600" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}

                              <DropdownMenuItem
                                onClick={() => printRequisition(req)}
                                disabled={printLoading === req._id}
                              >
                                <Printer className="h-4 w-4 mr-2" />
                                {printLoading === req._id
                                  ? "Printing..."
                                  : "Print"}
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => downloadAsPDF(req)}
                                disabled={pdfLoading === req._id}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                {pdfLoading === req._id
                                  ? "Generating..."
                                  : "Download PDF"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
