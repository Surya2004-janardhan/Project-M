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

module.exports = router;
