import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Token management with localStorage
export const tokenManager = {
  setToken: (token) => {
    localStorage.setItem("authToken", token);
  },

  getToken: () => {
    return localStorage.getItem("authToken");
  },

  removeToken: () => {
    localStorage.removeItem("authToken");
  },

  setUserId: (userId) => {
    localStorage.setItem("userId", userId);
  },

  getUserId: () => {
    return localStorage.getItem("userId");
  },

  removeUserId: () => {
    localStorage.removeItem("userId");
  },

  isTokenValid: () => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    try {
      // Decode JWT payload (basic check)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp > currentTime;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  },
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.removeToken();
      tokenManager.removeUserId();
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });
      if (response.data.token) {
        return {
          success: true,
          token: response.data.token,
          user: { ...response.data.user, name: email.split("@")[0] }, // Temporary name fallback
        };
      }
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  },

  register: async (name, email, password, channelLink = "") => {
    try {
      const response = await api.post("/singup", {
        name,
        email,
        password,
        channelLink,
      });
      if (response.status === 201) {
        // After successful registration, login the user
        return await authAPI.login(email, password);
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  },

  getProfile: async (userId) => {
    try {
      const response = await api.get(`/user${userId}`);
      return { success: true, user: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get profile",
      };
    }
  },
};

// YouTube API calls
export const youtubeAPI = {
  getChannelId: async (channelLink) => {
    try {
      const response = await api.post("/youtube/channelId", { channelLink });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get channel ID",
      };
    }
  },

  getChannelData: async (channelId) => {
    try {
      const response = await api.post("/youtube/channelData", { channelId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get channel data",
      };
    }
  },

  getVideoId: async (videoLink) => {
    try {
      const response = await api.post("/youtube/videoId", { videoLink });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get video ID",
      };
    }
  },

  getVideoData: async (videoId) => {
    try {
      const response = await api.post("/youtube/videoData", { videoId });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get video data",
      };
    }
  },

  getComments: async (videoId, preference = "all") => {
    try {
      const response = await api.post(
        `/youtube/comments?preference=${preference}`,
        { videoId }
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get comments",
      };
    }
  },

  getLLMReply: async (videoContext, transcript, comment) => {
    try {
      const response = await api.post("/youtube/llmReply", {
        videoContext,
        transcript,
        comment,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to generate reply",
      };
    }
  },
};

// User Data API calls
export const userAPI = {
  getUserData: async (userId) => {
    try {
      const response = await api.get(`/user${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get user data",
      };
    }
  },

  getPreviousData: async (userId) => {
    try {
      const response = await api.get(`/user/previous/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get previous data",
      };
    }
  },

  insertData: async (userId, data) => {
    try {
      const response = await api.post(`/user/insertData/${userId}`, { data });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to insert data",
      };
    }
  },

  getCommentsData: async (userId) => {
    try {
      const response = await api.get(`/user/commentsData/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get comments data",
      };
    }
  },
};

// OAuth API calls
export const oauthAPI = {
  initiateGoogleOAuth: () => {
    window.location.href = `${API_BASE_URL}/oauth/google`;
  },

  associateOAuthData: async (oauthData) => {
    const response = await fetch(`${API_BASE_URL}/oauth/associate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenManager.getToken()}`,
      },
      body: JSON.stringify({ oauthData }),
    });
    return response.json();
  },
};

// Admin API calls
export const adminAPI = {
  getAdminData: async () => {
    try {
      const response = await api.get("/user/admin/");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Access denied",
      };
    }
  },

  getAllUsers: async () => {
    try {
      const response = await api.get("/user/admin/users");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get users",
      };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/user/admin/user/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get user",
      };
    }
  },
};
