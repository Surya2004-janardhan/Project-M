import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

console.log("API_BASE_URL configured as:", API_BASE_URL);

// Enhanced token manager with improved persistence and debugging
export const tokenManager = {
  // Get JWT token with validation
  getToken: () => {
    const token = localStorage.getItem("authToken");
    console.log(
      "🔍 Retrieving JWT token:",
      token ? "Token exists" : "No token found"
    );
    return token;
  },

  // Set JWT token with verification
  setToken: (token) => {
    if (!token) {
      console.warn("⚠️ Attempted to set empty JWT token");
      return;
    }
    localStorage.setItem("authToken", token);
    console.log("✅ JWT token stored in localStorage");

    // For debugging - verify it was set
    setTimeout(() => {
      const storedToken = localStorage.getItem("authToken");
      console.log("🔍 Token storage verification:", {
        tokenSet: !!token,
        tokenStored: !!storedToken,
        match: token === storedToken,
      });
    }, 100);
  },

  // Get User ID with validation
  getUserId: () => {
    const userId = localStorage.getItem("userId");
    console.log("🔍 Retrieving user ID:", userId ? "ID exists" : "No ID found");
    return userId;
  },

  // Set User ID with verification
  setUserId: (userId) => {
    if (!userId) {
      console.warn("⚠️ Attempted to set empty user ID");
      return;
    }
    localStorage.setItem("userId", userId);
    console.log("✅ User ID stored in localStorage:", userId);
  },

  // Check if YouTube is connected
  isYouTubeConnected: () => {
    const hasNewToken = !!localStorage.getItem("yt_access_token");
    const hasOldToken = !!localStorage.getItem("youtubeAccessToken");
    const result = hasNewToken || hasOldToken;

    console.log("🔍 YouTube connection check:", {
      hasNewToken,
      hasOldToken,
      isConnected: result,
    });

    return result;
  },

  // Get YouTube access token from either format
  getYouTubeAccessToken: () => {
    // Try new format first
    const newToken = localStorage.getItem("yt_access_token");
    if (newToken) return newToken;

    // Fall back to old format
    return localStorage.getItem("youtubeAccessToken");
  },

  // Get YouTube refresh token from either format
  getYouTubeRefreshToken: () => {
    // Try new format first
    const newToken = localStorage.getItem("yt_refresh_token");
    if (newToken) return newToken;

    // Fall back to old format
    return localStorage.getItem("youtubeRefreshToken");
  },

  // Debug YouTube storage
  debugYouTubeStorage: () => {
    const items = {
      yt_access_token: localStorage.getItem("yt_access_token"),
      yt_refresh_token: localStorage.getItem("yt_refresh_token"),
      youtubeAccessToken: localStorage.getItem("youtubeAccessToken"),
      youtubeRefreshToken: localStorage.getItem("youtubeRefreshToken"),
      youtube_oauth_data: localStorage.getItem("youtube_oauth_data"),
    };

    console.table({
      yt_access_token: !!items.yt_access_token,
      yt_refresh_token: !!items.yt_refresh_token,
      youtubeAccessToken: !!items.youtubeAccessToken,
      youtubeRefreshToken: !!items.youtubeRefreshToken,
      youtube_oauth_data: !!items.youtube_oauth_data,
    });

    return items;
  },

  // Set YouTube tokens (new format)
  setYouTubeTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem("yt_access_token", accessToken);
      console.log("✅ YouTube access token stored");
    }

    if (refreshToken) {
      localStorage.setItem("yt_refresh_token", refreshToken);
      console.log("✅ YouTube refresh token stored");
    }
  },

  // Clear all tokens and data (for logout)
  clearAll: () => {
    console.log("🧹 Clearing all tokens and data...");
    localStorage.clear();
    console.log("✅ All tokens and data cleared completely");
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

// Helper function to handle API responses and check for expired tokens
const handleApiResponse = async (response, navigate) => {
  if (response.status === 401) {
    try {
      const errorData = await response.json();
      if (errorData.expired) {
        console.log("🔒 JWT token expired detected in API response");
        // Clear all tokens and redirect to login
        tokenManager.clearAll();
        if (navigate) {
          navigate("/login", {
            state: { message: "Your session has expired. Please login again." },
          });
        } else if (window.location) {
          window.location.href = "/login";
        }
        return null;
      }
    } catch (e) {
      // If we can't parse the response, still handle as unauthorized
      console.log("🔒 Unauthorized response detected");
      tokenManager.clearAll();
      if (navigate) {
        navigate("/login");
      }
      return null;
    }
  }
  return response;
};

// Enhanced API base with automatic token expiration handling
const apiWithAuth = async (url, options = {}) => {
  const token = tokenManager.getToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Check for token expiration
  const handledResponse = await handleApiResponse(response);
  if (!handledResponse) {
    throw new Error("Authentication expired");
  }

  return handledResponse;
};

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

  // Complete logout function that clears all storage
  logout: () => {
    console.log("🧹 Complete logout initiated...");

    // Clear all localStorage data
    localStorage.clear();

    console.log(
      "✅ All tokens and storage cleared - Complete logout successful"
    );

    return { success: true };
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
  analyzeChannelWithOAuth: async (ChannelId) => {
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
          body: JSON.stringify({ ChannelId }),
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
