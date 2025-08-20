const User = require("../models/User");

// YouTube Controller
const youtubeController = {
  // Extract channel ID from YouTube link
  getChannelId: async (req, res) => {
    try {
      const { channelLink } = req.body;
      if (!channelLink) {
        return res.status(400).json({ message: "Channel link is required" });
      }
      const regex =
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:channel\/|c\/|user\/)?([^/?]+)/;
      const match = channelLink.match(regex);
      if (!match || match.length < 2) {
        return res
          .status(400)
          .json({ message: "Invalid YouTube channel link" });
      }
      const channelId = match[1];
      res.status(200).json({ channelId });
    } catch (error) {
      console.error("Error extracting channel ID:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Get channel data from YouTube API
  getChannelData: async (req, res) => {
    try {
      const { channelId } = req.body;
      if (!channelId) {
        return res.status(400).json({ message: "Channel ID is required" });
      }
      const userEmail = req.user.email; // Get the user from the middleware
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized user" });
      }
      const existingUser = await User.findOne({ email: userEmail });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Check if the channel data already exists for the user
      if (existingUser.channelData && existingUser.channelData[channelId]) {
        return res.status(200).json({
          message: "Channel data already exists",
          channelData: existingUser.channelData[channelId],
        });
      } else {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
        );
        const data = await response.json();
        if (data.error) {
          return res.status(400).json({ message: data.error.message });
        }
        res.status(200).json(data);
      }
    } catch (error) {
      console.error("Error fetching channel data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Extract video ID from YouTube link
  getVideoId: async (req, res) => {
    try {
      const { videoLink } = req.body;
      if (!videoLink) {
        return res.status(400).json({ message: "Video link is required" });
      }
      const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
      const match = videoLink.match(regex);
      if (!match || match.length < 2) {
        return res.status(400).json({ message: "Invalid YouTube video link" });
      }
      const videoId = match[1];
      res.status(200).json({ videoId });
    } catch (error) {
      console.error("Error extracting video ID:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Get video data from YouTube API
  getVideoData: async (req, res) => {
    try {
      const { videoId } = req.body;
      if (!videoId) {
        return res.status(400).json({ message: "Video ID is required" });
      }
      const apiKey = process.env.YOUTUBE_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.error) {
        return res.status(400).json({ message: data.error.message });
      }
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching video data:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Fetch comments and auto reply
  getCommentsAndReply: async (req, res) => {
    try {
      const preference = req.query.preference || "all"; // Get preference from query params, default to 'all'
      // based on the preferene reply comments based on the highest likes or recent
      if (
        preference !== "all" &&
        preference !== "likes" &&
        preference !== "recent"
      ) {
        return res.status(400).json({ message: "Invalid preference value" });
      }

      const { videoId } = req.body;
      if (!videoId) {
        return res.status(400).json({ message: "Video ID is required" });
      }
      const apiKey = process.env.YOUTUBE_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.error) {
        return res.status(400).json({ message: data.error.message });
      }

      // Auto reply to comments
      const commentsData = data.items.map((item) => {
        const comment = item.snippet.topLevelComment.snippet;
        const commentId = item.id;
        const author = comment.authorDisplayName;
        const text = comment.textDisplay;
        const replyText = `Thank you for your comment, ${author}!`;
        // Here you would normally send the reply using YouTube API
        // For now, we will just log it
        console.log(`Replying to comment ID ${commentId}: ${replyText}`);
        return {
          commentId,
          author,
          text,
          replyText,
        };
      });
      // Save comments data to the user's document
      const userEmail = req.user.email; // Get the user from the middleware
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized user" });
      }
      const existingUser = await User.findOne({ email: userEmail });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      existingUser.commentsData.push({
        videoId,
        comments: commentsData,
        repliedCount: commentsData.length, // Count of comments replied to
      });
      await existingUser.save();
      res.status(200).json({
        message: "Comments fetched and replied successfully",
        commentsData,
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Generate LLM reply for comments
  generateLLMReply: async (req, res) => {
    try {
      const { videoContext, transcript, comment } = req.body;
      if (!videoContext || !transcript || !comment) {
        return res.status(400).json({ message: "All fields are required" });
      }
      // write gemini llm logic below
      // This is a placeholder for the actual LLM logic.
      // In a real application, you would call the LLM API with the video context,
      // transcript, and comment to generate a suitable reply.
      // For demonstration purposes, we will simulate a reply.
      const reply = `This is a simulated reply to your comment: "${comment}" based on the video context and transcript.`;
      res.status(200).json({ reply });
    } catch (error) {
      console.error("Error generating LLM reply:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = youtubeController;
