const express = require("express");
const axios = require("axios");
const { google } = require("googleapis");
const User = require("../models/User");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  FRONTEND_URL,
} = process.env;

// Step 1: Redirect user to Google for OAuth consent
exports.initiateGoogleOAuth = (req, res) => {
  console.log("🚀 Starting OAuth flow...");

  const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/youtube.force-ssl",
  ].join(" ");

  const redirectUri =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  console.log("🔄 Redirecting to:", redirectUri);
  res.redirect(redirectUri);
};

// Step 2: Google redirects here with "code", exchange it for tokens
exports.handleGoogleCallback = async (req, res) => {
  const { code, error } = req.query;
  console.log("📥 OAuth callback received:", { hasCode: !!code, error });

  if (error) {
    console.log("❌ OAuth error:", error);
    return res.redirect(
      `${FRONTEND_URL}/?oauth_error=${encodeURIComponent(error)}`
    );
  }
  if (!code) {
    console.log("❌ No authorization code received");
    return res.redirect(`${FRONTEND_URL}/?oauth_error=no_code`);
  }

  try {
    console.log("🔄 Exchanging code for tokens...");
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: GOOGLE_REDIRECT_URI,
          grant_type: "authorization_code",
        },
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    const tokenData = tokenResponse.data;

    if (tokenData.error) {
      console.log("❌ Token exchange error:", tokenData.error);
      return res.redirect(
        `${FRONTEND_URL}/?oauth_error=${encodeURIComponent(
          tokenData.error_description || tokenData.error
        )}`
      );
    }

    console.log("✅ Tokens received, fetching user info...");
    // Fetch user info to confirm identity
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );
    const userInfo = userInfoResponse.data;

    if (userInfo.error) {
      console.log("❌ User info error:", userInfo.error);
      return res.redirect(
        `${FRONTEND_URL}/?oauth_error=${encodeURIComponent(
          userInfo.error.message
        )}`
      );
    }

    console.log("👤 User info retrieved:", userInfo.email);

    // Send tokens and user data to frontend via URL
    const payload = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      user: userInfo,
    };
    const encodedPayload = encodeURIComponent(JSON.stringify(payload));

    console.log("🔄 Redirecting to frontend with tokens...");
    // Redirect to frontend with tokens
    res.redirect(`${FRONTEND_URL}/?oauth_success=true&data=${encodedPayload}`);
  } catch (err) {
    console.error("❌ OAuth Callback Error:", err);
    res.redirect(`${FRONTEND_URL}/?oauth_error=server_error`);
  }
};

// Updated Google OAuth callback using axios
exports.handleGoogleCallbackFixed = async (req, res) => {
  const { code, error } = req.query;
  console.log("📥 OAuth callback received:", { hasCode: !!code, error });

  if (error) {
    console.log("❌ OAuth error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/?oauth_error=${encodeURIComponent(error)}`
    );
  }
  if (!code) {
    console.log("❌ No authorization code received");
    return res.redirect(`${process.env.FRONTEND_URL}/?oauth_error=no_code`);
  }

  try {
    console.log("🔄 Exchanging code for tokens...");

    // Exchange authorization code for tokens using axios
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const tokenData = tokenResponse.data;
    console.log("✅ Token exchange successful");

    if (tokenData.error) {
      console.log("❌ Token exchange error:", tokenData.error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/?oauth_error=${encodeURIComponent(
          tokenData.error_description || tokenData.error
        )}`
      );
    }

    console.log("🔄 Fetching user info...");
    // Fetch user info using axios
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const userInfo = userInfoResponse.data;
    console.log("👤 User info retrieved:", userInfo.email);

    if (userInfo.error) {
      console.log("❌ User info error:", userInfo.error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/?oauth_error=${encodeURIComponent(
          userInfo.error.message
        )}`
      );
    }

    // Send tokens and user data to frontend via URL
    const payload = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      user: userInfo,
    };
    const encodedPayload = encodeURIComponent(JSON.stringify(payload));

    console.log("🔄 Redirecting to frontend with tokens...");
    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL}/?oauth_success=true&data=${encodedPayload}`
    );
  } catch (err) {
    console.error("❌ OAuth Callback Error:", err.message);
    res.redirect(`${process.env.FRONTEND_URL}/?oauth_error=server_error`);
  }
};

// Store YouTube tokens after successful OAuth
exports.storeYouTubeTokens = async (req, res) => {
  try {
    const { access_token, refresh_token } = req.body;
    const userId = req.user.id;

    await User.findByIdAndUpdate(userId, {
      youtubeAccessToken: access_token,
      youtubeRefreshToken: refresh_token,
      youtubeConnectedAt: new Date(),
    });

    res.json({
      success: true,
      message: "YouTube account connected successfully",
    });
  } catch (error) {
    console.error("Store YouTube tokens error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to store YouTube tokens",
    });
  }
};

// Manual token storage endpoint for debugging
exports.storeTokensManually = async (req, res) => {
  try {
    const { access_token, refresh_token } = req.body;
    const userId = req.user.id;

    console.log("Storing tokens for user:", userId);
    console.log("Access token exists:", !!access_token);
    console.log("Refresh token exists:", !!refresh_token);

    const result = await User.findByIdAndUpdate(
      userId,
      {
        youtubeAccessToken: access_token,
        youtubeRefreshToken: refresh_token,
        youtubeConnectedAt: new Date(),
      },
      { new: true }
    );

    console.log("User updated:", result ? "success" : "failed");

    res.json({
      success: true,
      message: "YouTube tokens stored successfully",
      data: {
        connected: !!(result.youtubeAccessToken && result.youtubeRefreshToken),
      },
    });
  } catch (error) {
    console.error("Manual token storage error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to store tokens",
    });
  }
};

// Enhanced OAuth debugging
exports.debugOAuth = (req, res) => {
  console.log("=== OAuth Debug Info ===");
  console.log("Environment variables:");
  console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
  console.log(
    "GOOGLE_CLIENT_SECRET exists:",
    !!process.env.GOOGLE_CLIENT_SECRET
  );
  console.log("GOOGLE_REDIRECT_URI:", process.env.GOOGLE_REDIRECT_URI);

  if (process.env.GOOGLE_CLIENT_ID) {
    console.log(
      "Client ID preview:",
      process.env.GOOGLE_CLIENT_ID.substring(0, 20) + "..."
    );
  }

  res.json({
    success: true,
    message: "OAuth Debug Info",
    config: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      clientIdPreview: process.env.GOOGLE_CLIENT_ID
        ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + "..."
        : "Not set",
    },
  });
};
