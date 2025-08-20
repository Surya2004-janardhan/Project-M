import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

console.log("API_BASE_URL configured as:", API_BASE_URL);

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

  // YouTube OAuth token management
  setYouTubeTokens: (accessToken, refreshToken) => {
    localStorage.setItem("youtubeAccessToken", accessToken);
    localStorage.setItem("youtubeRefreshToken", refreshToken);
    localStorage.setItem("youtubeConnectedAt", Date.now().toString());
  },

  getYouTubeAccessToken: () => {
    return localStorage.getItem("youtubeAccessToken");
  },

  getYouTubeRefreshToken: () => {
    return localStorage.getItem("youtubeRefreshToken");
  },

  isYouTubeConnected: () => {
    const accessToken = localStorage.getItem("youtubeAccessToken");
    const refreshToken = localStorage.getItem("youtubeRefreshToken");
    const isConnected = !!(accessToken && refreshToken);

    console.log("🔍 YouTube connection check:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isConnected,
    });

    return isConnected;
  },

  removeYouTubeTokens: () => {
    localStorage.removeItem("youtubeAccessToken");
    localStorage.removeItem("youtubeRefreshToken");
    localStorage.removeItem("youtubeConnectedAt");
  },

  // Clear all tokens (for logout)
  clearAll: () => {
    console.log("🧹 Clearing all tokens and OAuth data...");

    // Clear JWT tokens
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");

    // Clear YouTube OAuth tokens (old format)
    localStorage.removeItem("youtubeAccessToken");
    localStorage.removeItem("youtubeRefreshToken");
    localStorage.removeItem("youtubeConnectedAt");
    localStorage.removeItem("youtubeUserInfo");
    localStorage.removeItem("youtubeTokenExpiry");
    localStorage.removeItem("youtubeTokenScope");

    // Clear YouTube OAuth tokens (new format)
    localStorage.removeItem("yt_access_token");
    localStorage.removeItem("yt_refresh_token");
    localStorage.removeItem("yt_token_expiry");
    localStorage.removeItem("yt_token_scope");
    localStorage.removeItem("yt_user_info");

    // Clear any other YouTube-related data
    localStorage.removeItem("youtube_oauth_data");

    console.log("✅ All tokens and OAuth data cleared");
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

  // Debug function to check all YouTube related localStorage items
  debugYouTubeStorage: () => {
    const items = {
      youtubeAccessToken: localStorage.getItem("youtubeAccessToken"),
      youtubeRefreshToken: localStorage.getItem("youtubeRefreshToken"),
      youtubeConnectedAt: localStorage.getItem("youtubeConnectedAt"),
      youtubeUserInfo: localStorage.getItem("youtubeUserInfo"),
      youtubeTokenExpiry: localStorage.getItem("youtubeTokenExpiry"),
      youtubeTokenScope: localStorage.getItem("youtubeTokenScope"),
    };

    console.log("📋 YouTube localStorage debug:", items);
    return items;
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
      tokenManager.clearAll(); // Clear all tokens including YouTube
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

  // Check OAuth connection status (now from localStorage)
  checkOAuthStatus: async () => {
    try {
      // First check localStorage
      const isConnected = tokenManager.isYouTubeConnected();

      if (isConnected) {
        return {
          success: true,
          data: {
            isConnected: true,
            source: "localStorage",
          },
        };
      }

      // If not in localStorage, check backend
      const response = await fetch(`${API_BASE_URL}/api/youtube/oauth-status`, {
        headers: {
          Authorization: `Bearer ${tokenManager.getToken()}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      // If backend says connected but localStorage doesn't have tokens, sync them
      if (result.success && result.data.isConnected) {
        // You might want to fetch tokens from backend here
        console.log(
          "Backend has tokens but localStorage does not - consider re-auth"
        );
      }

      return result;
    } catch (error) {
      console.error("Check OAuth status error:", error);
      return { success: false, message: "Failed to check OAuth status" };
    }
  },

  // Analyze channel using OAuth authenticated client (with localStorage tokens)
  analyzeChannelWithOAuth: async (channelLink) => {
    try {
      // Check if we have tokens in localStorage
      if (!tokenManager.isYouTubeConnected()) {
        return {
          success: false,
          message:
            "YouTube account not connected. Please connect your YouTube account first.",
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/youtube/analyze-channel-oauth`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenManager.getToken()}`,
            "Content-Type": "application/json",
            "X-YouTube-Access-Token": tokenManager.getYouTubeAccessToken(),
            "X-YouTube-Refresh-Token": tokenManager.getYouTubeRefreshToken(),
          },
          body: JSON.stringify({ channelLink }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Channel analysis error:", error);
      return { success: false, message: "Failed to analyze channel" };
    }
  },

  // Get user's YouTube channels
  getUserChannels: async () => {
    try {
      // Get access token from localStorage (new format)
      const accessToken =
        localStorage.getItem("yt_access_token") ||
        tokenManager.getYouTubeAccessToken();

      if (!accessToken) {
        return {
          success: false,
          message:
            "YouTube access token not found. Please connect your YouTube account first.",
        };
      }

      console.log("🔍 Fetching user YouTube channels...");
      const response = await fetch(`${API_BASE_URL}/api/youtube/channels`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!result.success) {
        console.error("❌ Failed to fetch channels:", result.error);
        return {
          success: false,
          message: result.error || "Failed to fetch YouTube channels",
        };
      }

      console.log(
        "✅ Channels fetched successfully:",
        result.data.items?.length || 0,
        "channels"
      );
      return {
        success: true,
        data: result.data.items || [],
        message: "Channels fetched successfully",
      };
    } catch (error) {
      console.error("❌ Get channels error:", error);
      return {
        success: false,
        message: "Network error while fetching channels",
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
    console.log("Initiating OAuth with URL:", `${API_BASE_URL}/oauth/google`);
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

  // Store YouTube tokens in localStorage after OAuth success
  storeYouTubeTokens: async (accessToken, refreshToken) => {
    try {
      // Store in localStorage immediately
      tokenManager.setYouTubeTokens(accessToken, refreshToken);

      // Also store in backend for persistence
      const response = await api.post("/oauth/store-youtube-tokens", {
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      return {
        success: true,
        message: "YouTube tokens stored successfully",
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to store tokens",
      };
    }
  },

  // Handle OAuth callback and extract tokens
  handleOAuthCallback: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokens = urlParams.get("tokens");
    const oauthSuccess = urlParams.get("oauth") === "success";

    if (oauthSuccess && tokens) {
      try {
        const tokenData = JSON.parse(decodeURIComponent(tokens));

        // Store tokens in localStorage
        tokenManager.setYouTubeTokens(
          tokenData.access_token,
          tokenData.refresh_token
        );

        return {
          success: true,
          message: "YouTube account connected successfully",
        };
      } catch (error) {
        console.error("Failed to parse OAuth tokens:", error);
        return {
          success: false,
          message: "Failed to process OAuth tokens",
        };
      }
    }

    return {
      success: false,
      message: "No OAuth tokens found",
    };
  },

  // Store tokens manually for testing
  storeTokensManually: async (access_token, refresh_token) => {
    try {
      const response = await api.post("/oauth/store-tokens-manual", {
        access_token,
        refresh_token,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to store tokens",
      };
    }
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
