const express = require("express");
const router = express.Router();
const youtubeController = require("../controllers/youtubeController");
const middleware = require("../middleware/authMiddleware");

// YouTube routes
router.post("/youtube/channelId", middleware, youtubeController.getChannelId);
router.post(
  "/youtube/channelData",
  middleware,
  youtubeController.getChannelData
);
router.post("/youtube/videoId", middleware, youtubeController.getVideoId);
router.post("/youtube/videoData", middleware, youtubeController.getVideoData);
router.post(
  "/youtube/comments",
  middleware,
  youtubeController.getCommentsAndReply
);
router.post(
  "/youtube/llmReply",
  middleware,
  youtubeController.generateLLMReply
);
router.get("/youtube/channels", middleware, youtubeController.getUserChannels);

// Add OAuth status and channel analysis routes
router.get("/oauth-status", middleware, youtubeController.checkOAuthStatus);
router.post(
  "/analyze-channel-oauth",
  middleware,
  youtubeController.analyzeChannelWithOAuth
);

// User channels route
router.get("/channels", youtubeController.getUserChannels);

module.exports = router;
