const express = require("express");
const router = express.Router();
const youtubeController = require("../controllers/youtubeController");
const authMiddleware = require("../middleware/authMiddleware");

// YouTube data routes
router.post("/channelId", youtubeController.getChannelId);
router.post("/channelData", youtubeController.getChannelData);
router.post("/videoId", youtubeController.getVideoId);
router.post("/videoData", youtubeController.getVideoData);
router.post("/comments", youtubeController.getCommentsAndReply);
router.post("/llmReply", youtubeController.generateLLMReply);

// OAuth YouTube routes
router.get("/oauth-status", authMiddleware, youtubeController.checkOAuthStatus);
router.post(
  "/analyze-channel-oauth",
  authMiddleware,
  youtubeController.analyzeChannelWithOAuth
);

// User channels route
router.get("/channels", youtubeController.getUserChannelsWithToken);

// Debug route to list all available routes
router.get("/debug-routes", (req, res) => {
  res.json({
    success: true,
    message: "YouTube routes are loaded",
    availableRoutes: [
      "POST /api/youtube/analyze-channel-oauth",
      "GET /api/youtube/oauth-status",
      "GET /api/youtube/channels",
      "POST /api/youtube/channelId",
      "POST /api/youtube/channelData",
      "POST /api/youtube/videoId",
      "POST /api/youtube/videoData",
      "POST /api/youtube/comments",
      "POST /api/youtube/llmReply",
    ],
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
