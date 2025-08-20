import React, { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:5000";

export const clearYouTubeTokens = () => {
  console.log("🧹 Clearing YouTube tokens...");
  localStorage.removeItem("yt_access_token");
  localStorage.removeItem("yt_refresh_token");
  localStorage.removeItem("yt_token_expiry");
  localStorage.removeItem("yt_token_scope");
  localStorage.removeItem("yt_user_info");
  localStorage.removeItem("youtubeConnectedAt");
  localStorage.removeItem("youtubeAccessToken");
  localStorage.removeItem("youtubeRefreshToken");
  localStorage.removeItem("youtubeUserInfo");
  localStorage.removeItem("youtube_oauth_data");
  console.log("✅ All YouTube tokens cleared");
};

// Function to handle OAuth completion and clear tokens
const YouTubeOAuthHandler = ({ onOAuthComplete }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Parse URL params on mount to get OAuth tokens
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("oauth_success") === "true") {
      console.log("✅ OAuth success detected");
      try {
        const data = JSON.parse(decodeURIComponent(params.get("data")));
        console.log("📦 OAuth data received:", {
          hasAccessToken: !!data.access_token,
          hasRefreshToken: !!data.refresh_token,
          userEmail: data.user?.email,
        });

        // Save tokens in localStorage for further API calls
        localStorage.setItem("yt_access_token", data.access_token);
        localStorage.setItem("yt_refresh_token", data.refresh_token);
        localStorage.setItem(
          "yt_token_expiry",
          Date.now() + data.expires_in * 1000
        );
        localStorage.setItem("yt_token_scope", data.scope);
        localStorage.setItem("yt_user_info", JSON.stringify(data.user));
        localStorage.setItem("youtubeConnectedAt", new Date().toISOString());

        // Also set the tokenManager tokens for compatibility
        localStorage.setItem("youtubeAccessToken", data.access_token);
        localStorage.setItem("youtubeRefreshToken", data.refresh_token);
        localStorage.setItem("youtubeUserInfo", JSON.stringify(data.user));

        setUser(data.user);

        // Clean URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        console.log("✅ YouTube tokens stored successfully");

        // Notify parent component
        if (onOAuthComplete) {
          onOAuthComplete({
            success: true,
            message: `Connected as ${data.user.name || data.user.email}`,
            userInfo: data.user,
            isConnected: true,
          });
        }
      } catch (parseError) {
        console.error("❌ Failed to parse OAuth data:", parseError);
        setError("Failed to process OAuth data");
        if (onOAuthComplete) {
          onOAuthComplete({
            success: false,
            message: "Failed to process OAuth data",
            isConnected: false,
          });
        }
      }
    }

    if (params.get("oauth_error")) {
      const errorMsg = params.get("oauth_error");
      console.error("❌ OAuth error:", errorMsg);
      setError(errorMsg);
      window.history.replaceState({}, document.title, window.location.pathname);

      if (onOAuthComplete) {
        onOAuthComplete({
          success: false,
          message: `OAuth error: ${errorMsg}`,
          isConnected: false,
        });
      }
    }
  }, [onOAuthComplete]);

  return null; // This component doesn't render anything
};

// Function to start OAuth flow
export const startYouTubeOAuth = () => {
  console.log("🚀 Starting YouTube OAuth flow...");
  window.location.href = `${BACKEND_URL}/oauth/google`;
};

// Function to check if user is connected
export const isYouTubeConnected = () => {
  const accessToken = localStorage.getItem("yt_access_token");
  const refreshToken = localStorage.getItem("yt_refresh_token");
  const expiry = localStorage.getItem("yt_token_expiry");

  const isConnected = !!(accessToken && refreshToken);
  const isExpired = expiry && Date.now() > parseInt(expiry);

  console.log("🔍 YouTube connection check:", {
    hasTokens: isConnected,
    isExpired: isExpired,
    expiresAt: expiry ? new Date(parseInt(expiry)).toLocaleString() : "N/A",
  });

  return isConnected && !isExpired;
};

// Function to get stored user info
export const getYouTubeUserInfo = () => {
  const userInfo = localStorage.getItem("yt_user_info");
  return userInfo ? JSON.parse(userInfo) : null;
};

export default YouTubeOAuthHandler;
