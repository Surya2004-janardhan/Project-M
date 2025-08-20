import React, { useEffect } from "react";
import { tokenManager } from "../api/api";

const OAuthHandler = ({ onOAuthComplete }) => {
  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthStatus = urlParams.get("oauth");
      const tokens = urlParams.get("tokens");

      if (oauthStatus === "success" && tokens) {
        try {
          const tokenData = JSON.parse(decodeURIComponent(tokens));
          console.log("OAuth tokens received:", tokenData);

          // Store YouTube tokens in localStorage
          tokenManager.setYouTubeTokens(
            tokenData.access_token,
            tokenData.refresh_token
          );

          // Store user info if available
          if (tokenData.userInfo) {
            localStorage.setItem(
              "youtubeUserInfo",
              JSON.stringify(tokenData.userInfo)
            );
          }

          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          // Notify parent component
          if (onOAuthComplete) {
            onOAuthComplete({
              success: true,
              message: "YouTube account connected successfully",
              userInfo: tokenData.userInfo,
            });
          }

          console.log("✅ YouTube tokens stored in localStorage");
        } catch (error) {
          console.error("Failed to process OAuth tokens:", error);
          if (onOAuthComplete) {
            onOAuthComplete({
              success: false,
              message: "Failed to process OAuth tokens",
            });
          }
        }
      } else if (oauthStatus === "error") {
        console.error("OAuth error received");
        if (onOAuthComplete) {
          onOAuthComplete({
            success: false,
            message: "OAuth authentication failed",
          });
        }
      }
    };

    handleOAuthCallback();
  }, [onOAuthComplete]);

  return null; // This component doesn't render anything
};

export default OAuthHandler;
