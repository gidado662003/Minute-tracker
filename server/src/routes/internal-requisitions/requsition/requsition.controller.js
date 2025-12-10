const InternalRequisition = require("../../../models/internal-requsitions-schema");
const HeadOfDepartments = require("../../../models/headofDepartments.schema");
const multer = require("multer");
const path = require("path");
const sendMail = require("../../../utilities/mailer");
const {
  newRequestTemplate,
  approvedTemplate,
  rejectedTemplate,
} = require("../../../utilities/mailTemplate");
require("dotenv").config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../../uploads");
    // Ensure directory exists
    require("fs").mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, `req-${unique}`);
  },
});

const upload = multer({ storage }).array("attachments", 5);

async function createInternalRequisition(req, res) {
  try {
    // Parse the JSON data from FormData
    const requisitionData = JSON.parse(req.body.data);

    const items = Array.isArray(requisitionData?.items)
      ? requisitionData.items
      : [];
    const totalAmount = items.reduce((sum, item) => {
      const qty = Number(item?.quantity) || 0;
      const unitPrice = Number(item?.unitPrice) || 0;
      const lineTotal =
        typeof item?.total === "number" ? item.total : qty * unitPrice;
      return sum + lineTotal;
    }, 0);

    // Generate a simple unique request number: IR-YYYYMMDD-<timestamp>
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const requisitionNumber = `IR-${y}${m}${d}-${Date.now()
      .toString()
      .slice(-6)}`;

    const attachments = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const internalRequisition = new InternalRequisition({
      ...requisitionData,
      items,
      totalAmount,
      requisitionNumber,
      attachments,
      department: req.user.department,
      user: {
        name: req.user.name,
        email: req.user.email,
        department: req.user.department,
        role: req.user.role,
      },
    });

    const { subject, html } = newRequestTemplate(
      requisitionNumber,
      requisitionData,
      items,
      totalAmount,
      req.user
    );

    await internalRequisition.save();
    const headOfDepartment = await HeadOfDepartments.findOne({
      department: req.user.department,
    });
    if (headOfDepartment) {
      sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: headOfDepartment.email,
        subject,
        html,
      });
    }

    res.status(201).json(internalRequisition);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to create request", error: error.message });
  }
}

async function getInternalRequisitions(req, res) {
  try {
    const userDepartment = req.user.department?.toLowerCase() || "";
    const userEmail = req.user.email;
    const userRoles = req.user.roles || [];

    const isFinance =
      userDepartment === "finance" || userRoles.includes("Finance");
    const isAdmin = userRoles.includes("Admin");

    // Determine if the current user is a Head of Department (Line Manager)
    let isHeadOfDepartment = false;
    if (userEmail && req.user.department) {
      const headOfDepartment = await HeadOfDepartments.findOne({
        email: userEmail,
        department: req.user.department,
      });
      if (headOfDepartment) {
        isHeadOfDepartment = true;
      }
    }

    let query = {};

    if (isFinance) {
      // Finance can see:
      // 1) ALL requests that have been approved by HoD (any department)
      // 2) Their OWN requests, even if not yet approved by HoD
      query = {
        $or: [
          { approvedByHeadOfDepartment: true },
          { "user.email": userEmail },
        ],
      };
    } else if (isHeadOfDepartment) {
      // Line Manager / HoD sees ALL requests from their department
      query = { department: req.user.department };
    } else {
      // Regular user: only their own requests
      query = { "user.email": userEmail };
    }

    const internalRequisitions = await InternalRequisition.find(query);
    res.status(200).json(internalRequisitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function getInternalRequisitionById(req, res) {
  const id = req.params.id;
  InternalRequisition.findById(id)
    .then((doc) => {
      if (!doc)
        return res
          .status(404)
          .json({ message: `Requisition with ID ${id} not found.` });
      res.status(200).json(doc);
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Failed to fetch request", error: error.message });
    });
}

async function updateInternalRequisition(req, res) {
  const id = req.params.id;
  const newStatus = req.body.status;

  try {
    const existingRequisition = await InternalRequisition.findById(id);

    if (!existingRequisition) {
      return res
        .status(404)
        .json({ message: `Requisition with ID ${id} not found.` });
    }

    const setPayload = {};

    // Always allow updating comment if provided
    if (typeof req.body.comment !== "undefined") {
      setPayload.comment = req.body.comment;
    }

    // Determine approver type (Finance vs Line Manager / Head of Department)
    const isFinanceUser =
      req?.user?.department?.toLowerCase() === "finance" ||
      req?.user?.roles?.includes("Finance");

    const isFinanceApproval = isFinanceUser && newStatus === "approved";

    let isHeadOfDepartmentApprover = false;

    if (newStatus === "approved" && !isFinanceApproval && req?.user?.email) {
      // Check if the current user is registered as Head of Department for the requisition's department
      // This allows HoD to approve requests from their department (including their own requests)
      const headOfDepartment = await HeadOfDepartments.findOne({
        email: req.user.email,
        department: existingRequisition.department,
      });

      if (headOfDepartment) {
        isHeadOfDepartmentApprover = true;
      }
    }

    // Business rules:
    // 1. Line Manager / HOD approves first -> mark approvedByHeadOfDepartment, set status to "in review"
    if (newStatus === "approved" && isHeadOfDepartmentApprover) {
      setPayload.approvedByHeadOfDepartment = true;
      setPayload.status = "in review";
      // Do NOT set status to "approved" here, so Finance can do the final approval
    }

    // 2. Finance/Admin final approval -> requires HOD approval first
    // Exception: If the requester is a HoD themselves, allow Finance to approve directly
    if (isFinanceApproval) {
      // Check if the requester is a Head of Department
      let isRequesterHoD = false;
      if (existingRequisition.user?.email) {
        const requesterHoD = await HeadOfDepartments.findOne({
          email: existingRequisition.user.email,
          department: existingRequisition.department,
        });
        if (requesterHoD) {
          isRequesterHoD = true;
        }
      }

      // Allow approval if HoD already approved OR if requester is HoD (self-approval scenario)
      if (!existingRequisition.approvedByHeadOfDepartment && !isRequesterHoD) {
        return res.status(400).json({
          message:
            "Line manager / Head of Department must approve this requisition before Finance can give final approval.",
        });
      }

      // If requester is HoD and not yet marked as approved by HoD, mark it now
      if (isRequesterHoD && !existingRequisition.approvedByHeadOfDepartment) {
        setPayload.approvedByHeadOfDepartment = true;
      }

      setPayload.status = "approved";
      setPayload.approvedOn = new Date();
      setPayload.approvedByFinance = {
        name: req.user.name,
        email: req.user.email,
        department: req.user.department,
        role: req.user.role,
      };
    }

    // 3. Rejection (either Finance or Line Manager) – directly set rejected status
    if (newStatus === "rejected") {
      setPayload.status = "rejected";
      setPayload.rejectedOn = new Date();
    }

    // Update the document
    const updatedDocument = await InternalRequisition.findByIdAndUpdate(
      id,
      { $set: setPayload },
      { new: true }
    );

    // 🔥 Email notifications
    // 1) Line Manager / HoD approval -> notify Finance only
    if (newStatus === "approved" && isHeadOfDepartmentApprover) {
      try {
        await sendMail({
          from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
          to: ["finance@syscodescomms.com"],
          subject: `Requisition ${updatedDocument.requisitionNumber} approved by line manager and pending finance approval`,
          html: `
            <p>Hello Finance Team,</p>
            <p>The following requisition has been approved by the line manager / Head of Department and is now awaiting your final approval:</p>
            <ul>
              <li><strong>Requisition No:</strong> ${
                updatedDocument.requisitionNumber
              }</li>
              <li><strong>Title:</strong> ${updatedDocument.title}</li>
              <li><strong>Department:</strong> ${
                updatedDocument.department
              }</li>
              <li><strong>Requested By:</strong> ${
                updatedDocument.user?.name
              } (${updatedDocument.user?.email})</li>
              <li><strong>Amount:</strong> ${updatedDocument.totalAmount}</li>
            </ul>
            <p>Comment from approver (if any): ${req.body.comment || "N/A"}</p>
          `,
        });
      } catch (err) {
        console.error(
          "❌ Failed to send finance notification email (line manager approval):",
          err
        );
      }
    }

    // 2) Final Finance decision (approved or rejected) -> notify requesting user
    const isFinalFinanceDecision =
      isFinanceUser && (newStatus === "approved" || newStatus === "rejected");

    if (isFinalFinanceDecision) {
      let emailTemplate;

      if (newStatus === "approved") {
        emailTemplate = approvedTemplate(
          updatedDocument,
          req.user,
          req.body.comment
        );
      } else {
        emailTemplate = rejectedTemplate(
          updatedDocument,
          req.user,
          req.body.comment
        );
      }

      try {
        await sendMail({
          from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
          to: [updatedDocument.user.email],
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      } catch (err) {
        console.error("❌ Failed to send final status email:", err);
      }
    }

    res.status(200).json({
      message: `Request ${id} successfully updated to status: ${newStatus}`,
      data: updatedDocument,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error processing update.", error: error.message });
  }
}

function deleteInternalRequisition(req, res) {
  const id = req.params.id;
  InternalRequisition.findByIdAndDelete(id)
    .then((doc) => {
      if (!doc)
        return res
          .status(404)
          .json({ message: `Requisition with ID ${id} not found.` });
      res
        .status(200)
        .json({ message: "Internal request deleted successfully" });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Failed to delete request",
        error: error.message,
      });
    });
}

module.exports = {
  createInternalRequisition,
  upload,
  getInternalRequisitions,
  getInternalRequisitionById,
  updateInternalRequisition,
  deleteInternalRequisition,
};
