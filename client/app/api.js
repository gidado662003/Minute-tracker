import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Adjust the base URL as needed
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("department");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

    // Only clear token for auth-related 401s where we actually sent a token
    const isAuth401 =
      status === 401 &&
      hadAuthHeader &&
      ["Token has expired", "Invalid token", "No token provided"].includes(
        message || ""
      );

    if (isAuth401) {
      try {
        localStorage.removeItem("department");
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
  const response = await api.post(
    "/internal-requisitions/create",
    requisitionData
  );
  return response.data;
};

export const getInternalRequisitions = async () => {
  const response = await api.get("/internal-requisitions/list");
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
