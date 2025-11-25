import axios from "axios";

// Dynamic API URL configuration based on current hostname
const getApiBaseURL = () => {
  if (typeof window === "undefined") {
    // Server-side rendering
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  }

  const { protocol, hostname } = window.location;

  // Use the same hostname but API port (5000)
  // This allows the app to work from any IP/domain
  return `${protocol}//${hostname}:5000/api`;
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
      console.log("[CLIENT] Sending request:", {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: true,
        tokenLength: authToken.length,
        tokenPreview: authToken.slice(0, 20) + "...",
      });
    } else {
      console.warn("[CLIENT] No authToken in localStorage for request:", {
        url: config.url,
        method: config.method?.toUpperCase(),
      });
    }
  } catch (err) {
    console.error("[CLIENT] Error in request interceptor:", err);
  }
  return config;
});

// Global 401 handler: clear token and reload to trigger department selection
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    const hadAuthHeader = Boolean(error?.config?.headers?.Authorization);

    console.log("[CLIENT] Response error:", {
      status,
      message,
      url: error?.config?.url,
      hadAuthHeader,
      responseData: error?.response?.data,
    });

    // Only clear token for auth-related 401s where we actually sent a token
    const isAuth401 =
      status === 401 &&
      hadAuthHeader &&
      ["Token has expired", "Invalid token", "No token provided"].includes(
        message || ""
      );

    if (isAuth401) {
      console.warn("[CLIENT] Auth 401 detected, clearing token and reloading");
      try {
        localStorage.removeItem("department");
        localStorage.removeItem("authToken");
      } catch {}
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export const getMeetings = async () => {
  const response = await api.get("/meetings");
  return response.data;
};

export const getCompletedMeetings = async () => {
  const response = await api.get("/meetings/completed");
  return response.data;
};
export const createMeeting = async (meetingData) => {
  const response = await api.post("/meetings", meetingData);
  return response.data;
};

export const updateActionItemStatus = async (meetingId, itemId, status) => {
  const response = await api.patch(
    `/meetings/${meetingId}/action-item/${itemId}/status`,
    status
  );
  return response.data;
};

export const getAllActionItems = async () => {
  const response = await api.get("/meetings/action-items");
  return response.data;
};

export const handleDepartment = async (department) => {
  const response = await api.post("/department", { department });
  return response.data;
};

// Dashboard stats helpers
export const getDashboardTotals = async () => {
  const response = await api.get("/meetings/stats/totals");
  return response.data;
};

export const getMonthlyMeetings = async () => {
  const response = await api.get("/meetings/stats/monthly");
  return response.data;
};

export const getTopOwners = async () => {
  const response = await api.get("/meetings/stats/top-owners");
  return response.data;
};

export const getOverdueActions = async () => {
  const response = await api.get("/meetings/stats/overdue-actions");
  return response.data;
};

export const createInternalRequisition = async (requisitionData) => {
  // Create FormData for multipart upload
  const formData = new FormData();

  // Append JSON data as strings
  formData.append(
    "data",
    JSON.stringify({
      ...requisitionData,
      attachments: undefined, // Remove attachments from JSON data
    })
  );

  // Append actual file objects
  if (requisitionData.attachments && requisitionData.attachments.length > 0) {
    requisitionData.attachments.forEach((attachment, index) => {
      formData.append("attachments", attachment.file, attachment.name);
    });
  }

  const response = await api.post("/internal-requisitions/create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getInternalRequisitions = async () => {
  const response = await api.get("/internal-requisitions/list");
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};
export const updateInternalRequisitionStatus = async (id, status, comment) => {
  console.log(
    "Updating requisition",
    id,
    "to status",
    status,
    "comment:",
    comment
  );
  const body = { status };
  if (typeof comment !== "undefined") body.comment = comment;
  const response = await api.put(`/internal-requisitions/${id}/status`, body);
  // server responds with { message, data: updatedDocument }
  return response.data?.data ?? response.data;
};

// n8n axios instance without auth
const n8n = axios.create({
  baseURL: "/n8n", // proxies through Next.js → avoids CORS
  withCredentials: false, // ❌ don't send cookies or tokens
});

// ✅ Webhook for spreadsheet
export const spreedsheetHook = async (data) => {
  console.log("Sending data to n8n webhook:", data);
  const response = await n8n.post(
    "/webhook/faae57b1-1be2-430f-97ae-7ee5ae5eb6b9",
    data
  );
  return response.data;
};
