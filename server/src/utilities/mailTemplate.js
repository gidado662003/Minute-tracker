// utilities/mailTemplate.js

function newRequestTemplate(
  requisitionNumber,
  requisitionData = {},
  items = [],
  totalAmount = 0,
  user = {}
) {
  const itemsTableRows = (items || [])
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
        item.description || "N/A"
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${
        item.quantity || 0
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₦${(
        item.unitPrice || 0
      ).toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₦${(
        item.total ||
        item.quantity * item.unitPrice ||
        0
      ).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  const listUrl = getListUrl();

  return {
    subject: `New Payment Request - ${requisitionNumber}`,
    html: `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f0f0f0; padding: 15px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { background-color: #f8f8f8; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
        .total-row { background-color: #f8f8f8; font-weight: bold; }
        .info-table { margin-bottom: 20px; }
        .info-table td { padding: 5px 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>New Payment Request</h2>
        <p><strong>Request ID:</strong> ${requisitionNumber}</p>
      </div>

      <table class="info-table">
        <tr>
          <td><strong>Title:</strong></td>
          <td>${requisitionData.title || "N/A"}</td>
      
       
        </tr>
        <tr>
          <td><strong>Requested By:</strong></td>
          <td>${user.name || "User"}</td>
          <td><strong>Date:</strong></td>
          <td>${new Date().toLocaleDateString()}</td>
        </tr>
      </table>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTableRows}
          <tr class="total-row">
            <td colspan="4" style="text-align: right; padding: 10px;"> Total:</td>
            <td style="text-align: right; padding: 10px;">₦${totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 20px; padding: 15px; background-color: #f8f8f8;">
        <p><strong>Account Details:</strong></p>
        <p>Name: ${
          (requisitionData.accountToPay &&
            requisitionData.accountToPay.accountName) ||
          "N/A"
        }</p>
        <p>Number: ${
          (requisitionData.accountToPay &&
            requisitionData.accountToPay.accountNumber) ||
          "N/A"
        }</p>
        <p>Bank: ${
          (requisitionData.accountToPay &&
            requisitionData.accountToPay.bankName) ||
          "N/A"
        }</p>
      </div>

      <div style="margin-top: 24px; text-align: center;">
        <a
          href="${listUrl}"
          style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 16px;"
        >
          To View Requests
        </a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">
          If the button does not work, copy and paste this link into your browser: <br />
          <a href="${listUrl}" style="color: #1d4ed8;">${listUrl}</a>
        </p>
      </div>
    </body>
  </html>`,
  };
}

const getListUrl = () => {
  const base =
    process.env.CLIENT_APP_URL ||
    process.env.FRONTEND_URL ||
    "http://10.0.0.253:3000";
  return `${base}/internal-requisitions/requisition-list`;
};

function approvedTemplate(doc, approver, comment) {
  const listUrl = getListUrl();
  return {
    subject: `✅ Requisition Approved - ${doc.requisitionNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Requisition Approved</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Payment Request Approved</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Your payment request has been processed successfully</p>
            </div>
            <div style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                Hi <strong>${doc.user.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                Your payment request has been <strong style="color: #10b981;">approved</strong>
              </p>
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Payment Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Request #:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                      doc.requisitionNumber
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Title:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      doc.title
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Department:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      doc.department
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Total Amount:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">₦${
                      doc.totalAmount?.toLocaleString() || "N/A"
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Approved On:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      doc.approvedOn
                        ? new Date(doc.approvedOn).toLocaleDateString()
                        : new Date().toLocaleDateString()
                    }</td>
                  </tr>
                </table>
              </div>
              <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #065f46; font-size: 16px;">Approval Information</h4>
                <p style="margin: 0; color: #065f46;">
                  <strong>Approved by:</strong> ${approver.name} (${
      approver.department
    })<br>
                  ${
                    comment
                      ? `<strong>Comment:</strong> ${comment}`
                      : "<strong>Comment:</strong> No additional comments provided"
                  }
                </p>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a
                  href="${listUrl}"
                  style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 16px;"
                >
                  View Your Requests
                </a>
                <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">
                  If the button does not work, copy and paste this link into your browser: <br />
                  <a href="${listUrl}" style="color: #059669;">${listUrl}</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>`,
  };
}

function rejectedTemplate(doc, approver, comment) {
  const listUrl = getListUrl();
  return {
    subject: `❌ Payment Request Rejected - ${doc.requisitionNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Request Rejected</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Payment Request Rejected</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 16px;">Your request requires revision</p>
            </div>
            <div style="padding: 40px;">
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                Hi <strong>${doc.user.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 24px;">
                We regret to inform you that your request has been <strong style="color: #ef4444;">rejected</strong>.
              </p>
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Payment Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Payment Request #:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${
                      doc.requisitionNumber
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Title:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      doc.title
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Department:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      doc.department
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Total Amount:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">₦${
                      doc.totalAmount?.toLocaleString() || "N/A"
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Rejected On:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${
                      doc.rejectedOn
                        ? new Date(doc.rejectedOn).toLocaleDateString()
                        : new Date().toLocaleDateString()
                    }</td>
                  </tr>
                </table>
              </div>
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px;">Rejection Information</h4>
                <p style="margin: 0; color: #991b1b;">
                  <strong>Rejected by:</strong> ${approver.name} (${
      approver.department
    })<br>
                  <strong>Reason:</strong> ${
                    comment || "No specific reason provided"
                  }
                </p>
              </div>
              <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px;">Next Steps</h4>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                  <li>Review the rejection reason and make necessary adjustments</li>
                  <li>Resubmit your request with the required changes</li>
                  <li>Contact the approver for clarification if needed</li>
                </ul>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a
                  href="${listUrl}"
                  style="display: inline-block; background: linear-gradient(135deg, #4b5563, #111827); color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 16px;"
                >
                  View Your Requests
                </a>
                <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">
                  If the button does not work, copy and paste this link into your browser: <br />
                  <a href="${listUrl}" style="color: #111827;">${listUrl}</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>`,
  };
}

module.exports = {
  newRequestTemplate,
  approvedTemplate,
  rejectedTemplate,
};
