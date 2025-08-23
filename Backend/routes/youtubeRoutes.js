const express = require(// Debug route to list all available routes
router.get('/debug-routes', (req, res) => {
  res.json({
    success: true,
    message: 'YouTube routes are loaded',
    availableRoutes: [
      'POST /api/youtube/analyze-channel-oauth - Analyze user\'s own channel',
      'GET /api/youtube/oauth-status - Check OAuth connection status',
      'GET /api/youtube/channels - Get user channels',
      'POST /api/youtube/channelId - Extract channel ID from URL',
      'POST /api/youtube/channelData - Get public channel data',
      'POST /api/youtube/videoId - Extract video ID from URL',
      'POST /api/youtube/videoData - Get video data',
      'POST /api/youtube/comments - Get video comments',
      'POST /api/youtube/llmReply - Generate AI reply'
    ],
    timestamp: new Date().toISOString()
  });
});

// Test route for OAuth functionality
router.get('/test-oauth', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'OAuth authentication working',
    user: {
      id: req.user._id,
      email: req.user.email
    },
    hasYouTubeTokens: !!(req.user.youtubeAccessToken),
    timestamp: new Date().toISOString()
  });
});

// Simple test route without auth
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'YouTube routes are working',
    timestamp: new Date().toISOString()
  });
});router = express.Router();
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
