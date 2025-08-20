const { google } = require("googleapis");
const User = require("../models/User");
const axios = require("axios");

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

  // Get user's YouTube channels from OAuth data
  getUserChannels: async (req, res) => {
    try {
      const userEmail = req.user.email;
      if (!userEmail) {
        return res.status(401).json({ message: "Unauthorized user" });
      }

      const existingUser = await User.findOne({ email: userEmail });
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!existingUser.oauthData || !existingUser.oauthData.accessToken) {
        return res.status(400).json({
          message:
            "YouTube not connected. Please connect your YouTube account first.",
        });
      }

      // Check if channels are already stored in OAuth data
      if (
        existingUser.oauthData.channels &&
        existingUser.oauthData.channels.length > 0
      ) {
        return res.status(200).json({
          channels: existingUser.oauthData.channels,
          message: "Channels fetched from stored data",
        });
      }

      // If not stored, fetch from YouTube API
      const channelsResponse = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true",
        {
          headers: {
            Authorization: `Bearer ${existingUser.oauthData.accessToken}`,
          },
        }
      );

      const channelsData = await channelsResponse.json();

      if (channelsData.error) {
        return res.status(400).json({ message: channelsData.error.message });
      }

      let userChannels = [];
      if (channelsData.items && channelsData.items.length > 0) {
        userChannels = channelsData.items.map((channel) => ({
          channelId: channel.id,
          channelTitle: channel.snippet.title,
          channelDescription: channel.snippet.description,
          channelThumbnail: channel.snippet.thumbnails?.default?.url,
          channelUrl: `https://www.youtube.com/channel/${channel.id}`,
          subscriberCount: channel.statistics?.subscriberCount || "0",
          videoCount: channel.statistics?.videoCount || "0",
          viewCount: channel.statistics?.viewCount || "0",
        }));

        // Update OAuth data with channels
        existingUser.oauthData.channels = userChannels;

        // Update user's channel link if not set
        if (!existingUser.channelLink && userChannels.length > 0) {
          existingUser.channelLink = userChannels[0].channelUrl;
        }

        await existingUser.save();
      }

      res.status(200).json({
        channels: userChannels,
        message: "Channels fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching user channels:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Get user's YouTube channels with access token
  getUserChannelsWithToken: async (req, res) => {
    try {
      // Expect access token in Authorization header as: Bearer <token>
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          error: "Missing or invalid Authorization header",
        });
      }

      const accessToken = authHeader.split(" ")[1];
      console.log("🔍 Fetching YouTube channels with access token");

      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        }
      );

      console.log("✅ YouTube channels fetched successfully");
      res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error(
        "❌ Error fetching YouTube channels:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        return res.status(401).json({
          success: false,
          error:
            "YouTube authentication expired. Please reconnect your account.",
        });
      }

      res.status(500).json({
        success: false,
        error: error.response?.data?.error?.message || "Internal server error",
      });
    }
  },

  // Check OAuth status
  checkOAuthStatus: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const isConnected = !!(
        user.youtubeAccessToken && user.youtubeRefreshToken
      );

      res.json({
        success: true,
        data: { isConnected },
      });
    } catch (error) {
      console.error("Check OAuth status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check OAuth status",
      });
    }
  },

  // Analyze channel with OAuth
  analyzeChannelWithOAuth: async (req, res) => {
    try {
      const { channelLink } = req.body;
      const userId = req.user.id;

      if (!channelLink) {
        return res.status(400).json({
          success: false,
          message: "Channel link is required",
        });
      }

      const user = await User.findById(userId);
      if (!user.youtubeAccessToken) {
        return res.status(401).json({
          success: false,
          message: "YouTube account not connected",
        });
      }

      // Initialize YouTube client with OAuth
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: user.youtubeAccessToken,
        refresh_token: user.youtubeRefreshToken,
      });

      const youtube = google.youtube({ version: "v3", auth: oauth2Client });

      // Extract channel ID from link
      let channelId;
      const channelIdMatch = channelLink.match(/channel\/([a-zA-Z0-9_-]+)/);
      const usernameMatch = channelLink.match(/user\/([a-zA-Z0-9_-]+)/);
      const handleMatch = channelLink.match(/@([a-zA-Z0-9_-]+)/);

      if (channelIdMatch) {
        channelId = channelIdMatch[1];
      } else if (usernameMatch) {
        // Convert username to channel ID
        const channelResponse = await youtube.channels.list({
          part: "id",
          forUsername: usernameMatch[1],
        });

        if (channelResponse.data.items.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Channel not found",
          });
        }

        channelId = channelResponse.data.items[0].id;
      } else if (handleMatch) {
        // Handle @username format
        const searchResponse = await youtube.search.list({
          part: "snippet",
          q: handleMatch[1],
          type: "channel",
          maxResults: 1,
        });

        if (searchResponse.data.items.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Channel not found",
          });
        }

        channelId = searchResponse.data.items[0].snippet.channelId;
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid channel link format",
        });
      }

      // Get channel data
      const channelResponse = await youtube.channels.list({
        part: "snippet,statistics,contentDetails",
        id: channelId,
      });

      if (channelResponse.data.items.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      const channelData = channelResponse.data.items[0];

      res.json({
        success: true,
        data: channelData,
        message: "Channel analyzed successfully",
      });
    } catch (error) {
      console.error("Channel analysis error:", error);

      if (error.code === 401 || error.message.includes("invalid_grant")) {
        return res.status(401).json({
          success: false,
          message:
            "YouTube authentication expired. Please reconnect your YouTube account.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to analyze channel",
      });
    }
  },
};

module.exports = youtubeController;
