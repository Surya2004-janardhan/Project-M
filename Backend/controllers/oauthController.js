const User = require("../models/User");

// OAuth Controller
const oauthController = {
  // Initialize Google OAuth
  initGoogleOAuth: (req, res) => {
    console.log("=== OAuth Init ===");
    console.log("Client ID:", process.env.GOOGLE_CLIENT_ID);
    console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI);

    // This route should redirect to Google's OAuth consent page with YouTube scope
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.force-ssl",
    ];

    const redirectUri =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes.join(" "))}&` +
      `access_type=offline&` +
      `prompt=consent`;

    console.log("Generated OAuth URL:", redirectUri);
    res.redirect(redirectUri);
  },

  // Handle Google OAuth callback
  handleGoogleCallback: async (req, res) => {
    console.log("=== OAuth Callback ===");
    console.log("Query params:", req.query);

    // This route handles the callback from Google after user consent
    const { code, error } = req.query;

    if (error) {
      console.log("OAuth error received:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(
        `${frontendUrl}?oauth_error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      console.log("No authorization code received");
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(
        `${frontendUrl}?oauth_error=${encodeURIComponent(
          "no_authorization_code"
        )}`
      );
    }

    try {
      console.log("Exchanging code for tokens...");
      // Exchange the authorization code for access token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log("Token response:", tokenData);

      if (tokenData.error) {
        console.log("Token exchange error:", tokenData.error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}?oauth_error=${encodeURIComponent(
            tokenData.error_description || tokenData.error
          )}`
        );
      }

      console.log("Fetching user info...");
      // Use the access token to fetch user info
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      const userInfo = await userInfoResponse.json();
      console.log("User info:", userInfo);

      if (userInfo.error) {
        console.log("User info error:", userInfo.error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(
          `${frontendUrl}?oauth_error=${encodeURIComponent(
            userInfo.error.message
          )}`
        );
      }

      // For demo purposes, we'll store this in a temporary session
      // In production, you'd want to associate this with a logged-in user
      const oauthData = {
        googleId: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
        tokenType: tokenData.token_type,
        connectedAt: new Date(),
      };

      console.log("OAuth data prepared:", oauthData);

      // Redirect to frontend with success message
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const redirectUrl = `${frontendUrl}?oauth_success=true&oauth_data=${encodeURIComponent(
        JSON.stringify(oauthData)
      )}`;
      console.log("Redirecting to:", redirectUrl);

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("OAuth callback error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}?oauth_error=${encodeURIComponent(
          "OAuth authentication failed"
        )}`
      );
    }
  },

  // Associate OAuth data with logged-in user
  associateOAuth: async (req, res) => {
    try {
      const { oauthData } = req.body;
      const userEmail = req.user.email;

      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized user" });
      }

      if (!oauthData) {
        return res.status(400).json({ message: "OAuth data is required" });
      }

      const existingUser = await User.findOne({ email: userEmail });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update existing user with OAuth data
      existingUser.oauthData = oauthData;
      await existingUser.save();

      res.status(200).json({
        message: "YouTube account successfully connected",
        user: {
          name: existingUser.name,
          email: existingUser.email,
          oauthConnected: true,
        },
      });
    } catch (error) {
      console.error("OAuth association error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = oauthController;
