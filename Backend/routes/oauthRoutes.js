const express = require("express");
const router = express.Router();
const oauthController = require("../controllers/oauthController");
const authMiddleware = require("../middleware/authMiddleware");

// Debug middleware to log all OAuth requests
router.use((req, res, next) => {
  console.log(`OAuth Route accessed: ${req.method} ${req.path}`);
  console.log(
    "Full URL:",
    req.protocol + "://" + req.get("host") + req.originalUrl
  );
  next();
});

// OAuth routes
router.get("/google", oauthController.initiateGoogleOAuth);
router.get("/google/callback", oauthController.handleGoogleCallbackFixed);
router.get("/debug", oauthController.debugOAuth);

// Store YouTube tokens route
router.post(
  "/store-youtube-tokens",
  authMiddleware,
  oauthController.storeYouTubeTokens
);

// Manual token storage for debugging
router.post(
  "/store-tokens-manual",
  authMiddleware,
  oauthController.storeTokensManually
);

// Test route to verify OAuth setup
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "OAuth routes are working",
    environment: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
  });
});

module.exports = router;
