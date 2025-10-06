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
