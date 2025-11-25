const InternalRequisition = require("../../../models/internal-requsitions-schema");
const multer = require("multer");
const path = require("path");
const sendMail = require("../../../utilities/mailer");
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
    const subject = `New Payment Request - ${requisitionNumber}`;
    const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>New Payment Request</title>
    </head>
    <body>
      <h1>New Payment Request Created</h1>
      <p>A new Payment Request (${requisitionNumber}) has been submitted.</p>
      <!-- Add more template content as needed -->
    </body>
  </html>
`;

    await internalRequisition.save();
    sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: "finance@syscodescomms.com",
      subject,
      html,
    });

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
    if (
      req.user.department.toLowerCase() === "finance" ||
      req.user.roles.includes("Admin")
    ) {
      const internalRequisitions = await InternalRequisition.find();
      res.status(200).json(internalRequisitions);
    } else {
      const internalRequisitions = await InternalRequisition.find({
        "user.name": req.user.name,
      });
      res.status(200).json(internalRequisitions);
    }
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
    const setPayload = { status: newStatus };

    if (newStatus === "approved") setPayload.approvedOn = new Date();
    if (newStatus === "rejected") setPayload.rejectedOn = new Date();
    if (typeof req.body.comment !== "undefined")
      setPayload.comment = req.body.comment;

    // Track who approved
    if (
      newStatus === "approved" &&
      (req?.user?.department === "finance" ||
        req?.user?.roles.includes("Admin"))
    ) {
      setPayload.approvedByFinance = {
        name: req.user.name,
        email: req.user.email,
        department: req.user.department,
        role: req.user.role,
      };
    }

    // Update the document
    const updatedDocument = await InternalRequisition.findByIdAndUpdate(
      id,
      { $set: setPayload },
      { new: true }
    );

    if (!updatedDocument) {
      return res
        .status(404)
        .json({ message: `Requisition with ID ${id} not found.` });
    }

    // 🔥 Send email after successful update
    // 🔥 Send email after successful update
    if (["approved", "rejected"].includes(newStatus)) {
      let subject, html;

      if (newStatus === "approved") {
        subject = `✅ Requisition Approved - ${updatedDocument.requisitionNumber}`;
        html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Requisition Approved</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Payment Request Approved</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Your payment request has been processed successfully</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                Hi <strong>${updatedDocument.user.name}</strong>,
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                Your payment request has been <strong style="color: #10b981;">approved</strong> 
              </p>

              <!-- Requisition Details -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Payment Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Request #:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                      updatedDocument.requisitionNumber
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Title:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      updatedDocument.title
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Department:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      updatedDocument.department
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Total Amount:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">₦${
                      updatedDocument.totalAmount?.toLocaleString() || "N/A"
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Approved On:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      updatedDocument.approvedOn
                        ? new Date(
                            updatedDocument.approvedOn
                          ).toLocaleDateString()
                        : new Date().toLocaleDateString()
                    }</td>
                  </tr>
                </table>
              </div>

              <!-- Approval Details -->
              <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #065f46; font-size: 16px;">Approval Information</h4>
                <p style="margin: 0; color: #065f46;">
                  <strong>Approved by:</strong> ${req.user.name} (${
          req.user.department
        })<br>
                  ${
                    req.body.comment
                      ? `<strong>Comment:</strong> ${req.body.comment}`
                      : "<strong>Comment:</strong> No additional comments provided"
                  }
                </p>
              </div>
          </div>
        </body>
      </html>
    `;
      } else if (newStatus === "rejected") {
        subject = `❌ Payment Request Rejected - ${updatedDocument.requisitionNumber}`;
        html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Request Rejected</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Payment Request Rejected</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Your request requires revision</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 10px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                Hi <strong>${updatedDocument.user.name}</strong>,
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                We regret to inform you that your request has been <strong style="color: #ef4444;">rejected</strong>.
              </p>

              <!-- Payment Request Details -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Payment Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Request #:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                      updatedDocument.requisitionNumber
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Title:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      updatedDocument.title
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Department:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      updatedDocument.department
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Total Amount:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">₦${
                      updatedDocument.totalAmount?.toLocaleString() || "N/A"
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Rejected On:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      updatedDocument.rejectedOn
                        ? new Date(
                            updatedDocument.rejectedOn
                          ).toLocaleDateString()
                        : new Date().toLocaleDateString()
                    }</td>
                  </tr>
                </table>
              </div>

              <!-- Rejection Details -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px;">Rejection Information</h4>
                <p style="margin: 0; color: #991b1b;">
                  <strong>Rejected by:</strong> ${req.user.name} (${
          req.user.department
        })<br>
                  <strong>Reason:</strong> ${
                    req.body.comment || "No specific reason provided"
                  }
                </p>
              </div>

              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">Next Steps</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                  <li>Review the rejection reason and make necessary adjustments</li>
                  <li>Resubmit your request with the required changes</li>
                  <li>Contact the approver for clarification if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
      }

      try {
        await sendMail({
          from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
          to: [updatedDocument.user.email, "finance@syscodescomms.com"],
          subject,
          html,
        });
        console.log(`📧 Email sent to ${updatedDocument.user.email}`);
      } catch (err) {
        console.error("❌ Failed to send status email:", err);
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
