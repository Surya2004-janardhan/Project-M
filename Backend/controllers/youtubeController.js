// cons; // Helper function to format large numbers
const formatLargeNumber = (num) => {
  const number = parseInt(num || 0);
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1) + "B";
  }
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  }
  return number.toString();
};

// Helper function to calculate channel age
const calculateChannelAge = (publishedAt) => {
  const creationDate = new Date(publishedAt);
  const now = new Date();
  const ageInDays = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));
  const ageInYears = Math.floor(ageInDays / 365);
  const remainingDays = ageInDays % 365;
  const ageInMonths = Math.floor(remainingDays / 30);

  if (ageInYears > 0) {
    return `${ageInYears} year${ageInYears > 1 ? "s" : ""} ${
      ageInMonths > 0 ? `${ageInMonths} month${ageInMonths > 1 ? "s" : ""}` : ""
    }`;
  }
  if (ageInMonths > 0) {
    return `${ageInMonths} month${ageInMonths > 1 ? "s" : ""}`;
  }
  return `${ageInDays} day${ageInDays > 1 ? "s" : ""}`;
};

// Helper function to calculate subscriber engagement
const calculateSubscriberEngagement = (stats) => {
  const subscribers = parseInt(stats?.subscriberCount || 0);
  const views = parseInt(stats?.viewCount || 0);

  if (subscribers === 0) return "No subscribers";

  const avgViewsPerSub = views / subscribers;
  if (avgViewsPerSub > 100) return "Excellent";
  if (avgViewsPerSub > 50) return "Good";
  if (avgViewsPerSub > 20) return "Average";
  return "Needs Improvement";
};

// Helper function to analyze channel performance
const analyzeChannelPerformance = (stats) => {
  const subscribers = parseInt(stats?.subscriberCount || 0);
  const videos = parseInt(stats?.videoCount || 0);
  const views = parseInt(stats?.viewCount || 0);

  const avgViewsPerVideo = videos > 0 ? views / videos : 0;
  const subsPerVideo = videos > 0 ? subscribers / videos : 0;

  let performance = [];

  if (avgViewsPerVideo > 10000) performance.push("High view count per video");
  if (subsPerVideo > 100) performance.push("Good subscriber growth rate");
  if (subscribers > 10000) performance.push("Strong subscriber base");
  if (videos > 100) performance.push("Consistent content creation");

  return performance.length > 0 ? performance : ["Growing channel"];
};

// Helper function to calculate content frequency
const calculateContentFrequency = (publishedAt, videoCount) => {
  const creationDate = new Date(publishedAt);
  const now = new Date();
  const ageInDays = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));
  const videos = parseInt(videoCount || 0);

  if (ageInDays === 0 || videos === 0) return "No content frequency data";

  const videosPerDay = videos / ageInDays;
  const videosPerWeek = videosPerDay * 7;
  const videosPerMonth = videosPerDay * 30;

  if (videosPerDay >= 1) return `${videosPerDay.toFixed(1)} videos per day`;
  if (videosPerWeek >= 1) return `${videosPerWeek.toFixed(1)} videos per week`;
  return `${videosPerMonth.toFixed(1)} videos per month`;
};
const { google } = require("googleapis");
const User = require("../models/User");
const axios = require("axios");

// Helper function to format large numbers
// const formatLargeNumber = (num) => {
//   const number = parseInt(num || 0);
//   if (number >= 1000000000) {
//     return (number / 1000000000).toFixed(1) + "B";
//   }
//   if (number >= 1000000) {
//     return (number / 1000000).toFixed(1) + "M";
//   }
//   if (number >= 1000) {
//     return (number / 1000).toFixed(1) + "K";
//   }
//   return number.toString();
// };

// YouTube Controller
const youtubeController = {
  // Extract channel ID from YouTube link
  getChannelId: async (req, res) => {
    try {
      console.log("here called the route ");
      console.log(req.body);
      const { channelLink } = req.body;
      console.log("channelLink: ", channelLink);
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
      console.log("channelId: ", channelId);
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
      console.log("📥 Channel analysis request:", { channelLink });

      if (!channelLink) {
        return res.status(400).json({
          success: false,
          message: "Channel link is required",
        });
      }

      // Try to get tokens from headers first (localStorage tokens)
      let accessToken = req.headers["x-youtube-access-token"];
      let refreshToken = req.headers["x-youtube-refresh-token"];

      console.log("🔍 Token check:", {
        hasXYouTubeAccessToken: !!accessToken,
        hasXYouTubeRefreshToken: !!refreshToken,
        hasAuthorizationHeader: !!req.headers.authorization,
      });

      // If not in headers, try Authorization header
      if (!accessToken && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          accessToken = authHeader.split(" ")[1];
          console.log("🔑 Using Authorization header token");
        }
      }

      // If still no tokens, try from database (fallback)
      if (!accessToken && req.user) {
        console.log("🔍 Checking database for tokens...");
        const user = await User.findById(req.user.id);
        accessToken = user?.youtubeAccessToken;
        refreshToken = user?.youtubeRefreshToken;
        console.log("💾 Database tokens:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });
      }

      if (!accessToken) {
        console.log("❌ No access token found");
        return res.status(401).json({
          success: false,
          message:
            "YouTube account not connected. Please connect your YouTube account first.",
        });
      }

      console.log("🔍 Analyzing channel with OAuth token");
      console.log("🔧 Environment check:", {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRedirectUri: !!process.env.GOOGLE_REDIRECT_URI,
      });

      // Initialize YouTube client with OAuth
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const youtube = google.youtube({ version: "v3", auth: oauth2Client });

      // Extract channel ID from link
      let channelId;
      console.log("🔍 Parsing channel link:", channelLink);

      const channelIdMatch = channelLink.match(/channel\/([a-zA-Z0-9_-]+)/);
      const usernameMatch = channelLink.match(/user\/([a-zA-Z0-9_-]+)/);
      const handleMatch = channelLink.match(/@([a-zA-Z0-9_-]+)/);
      const cMatch = channelLink.match(/\/c\/([a-zA-Z0-9_-]+)/);

      console.log("🔍 Link parsing results:", {
        channelIdMatch: !!channelIdMatch,
        usernameMatch: !!usernameMatch,
        handleMatch: !!handleMatch,
        cMatch: !!cMatch,
      });

      if (channelIdMatch) {
        channelId = channelIdMatch[1];
        console.log("✅ Found channel ID:", channelId);
      } else if (usernameMatch) {
        console.log("🔍 Converting username to channel ID:", usernameMatch[1]);
        const channelResponse = await youtube.channels.list({
          part: "id",
          forUsername: usernameMatch[1],
        });

        if (channelResponse.data.items.length === 0) {
          console.log("❌ Channel not found for username:", usernameMatch[1]);
          return res.status(404).json({
            success: false,
            message: "Channel not found",
          });
        }

        channelId = channelResponse.data.items[0].id;
        console.log("✅ Converted to channel ID:", channelId);
      } else if (handleMatch) {
        console.log("🔍 Searching for handle:", handleMatch[1]);
        const searchResponse = await youtube.search.list({
          part: "snippet",
          q: handleMatch[1],
          type: "channel",
          maxResults: 1,
        });

        if (searchResponse.data.items.length === 0) {
          console.log("❌ Channel not found for handle:", handleMatch[1]);
          return res.status(404).json({
            success: false,
            message: "Channel not found",
          });
        }

        channelId = searchResponse.data.items[0].snippet.channelId;
        console.log("✅ Found channel ID from handle:", channelId);
      } else if (cMatch) {
        console.log("🔍 Converting custom URL to channel ID:", cMatch[1]);
        const searchResponse = await youtube.search.list({
          part: "snippet",
          q: cMatch[1],
          type: "channel",
          maxResults: 1,
        });

        if (searchResponse.data.items.length === 0) {
          console.log("❌ Channel not found for custom URL:", cMatch[1]);
          return res.status(404).json({
            success: false,
            message: "Channel not found",
          });
        }

        channelId = searchResponse.data.items[0].snippet.channelId;
        console.log("✅ Found channel ID from custom URL:", channelId);
      } else {
        console.log("❌ Invalid channel link format:", channelLink);
        return res.status(400).json({
          success: false,
          message:
            "Invalid channel link format. Please use a valid YouTube channel URL.",
        });
      }

      console.log("🔍 Fetching channel data for:", channelId);

      // Get channel data using OAuth
      const channelResponse = await youtube.channels.list({
        part: "snippet,statistics,contentDetails",
        id: channelId,
      });

      console.log("📊 Channel API response:", {
        itemsFound: channelResponse.data.items?.length || 0,
        hasError: !!channelResponse.data.error,
      });

      if (channelResponse.data.items.length === 0) {
        console.log("❌ No channel data returned for ID:", channelId);
        return res.status(404).json({
          success: false,
          message: "Channel not found or not accessible",
        });
      }

      // Get user's own channels to verify ownership
      console.log("🔍 Checking if channel belongs to authenticated user...");
      const userChannelsResponse = await youtube.channels.list({
        part: "id,snippet",
        mine: true,
      });

      const userChannelIds = userChannelsResponse.data.items.map(
        (channel) => channel.id
      );
      const isOwnChannel = userChannelIds.includes(channelId);

      if (!isOwnChannel) {
        console.log("❌ Channel does not belong to authenticated user");
        return res.status(403).json({
          success: false,
          message:
            "This channel does not belong to your authenticated account. You can only analyze your own channels.",
          isOwnChannel: false,
        });
      }

      const rawChannelData = channelResponse.data.items[0];
      console.log(
        "✅ Channel analyzed successfully (Own Channel):",
        rawChannelData.snippet?.title
      );

      // Enhanced channel data with formatted statistics and analysis
      const enhancedChannelData = {
        id: rawChannelData.id,
        title: rawChannelData.snippet.title,
        description: rawChannelData.snippet.description,
        customUrl: rawChannelData.snippet.customUrl,
        publishedAt: rawChannelData.snippet.publishedAt,
        country: rawChannelData.snippet.country,
        defaultLanguage: rawChannelData.snippet.defaultLanguage,
        thumbnails: rawChannelData.snippet.thumbnails,
        statistics: {
          subscriberCount: parseInt(
            rawChannelData.statistics?.subscriberCount || 0
          ),
          videoCount: parseInt(rawChannelData.statistics?.videoCount || 0),
          viewCount: parseInt(rawChannelData.statistics?.viewCount || 0),
          hiddenSubscriberCount:
            rawChannelData.statistics?.hiddenSubscriberCount,
        },
        formatted: {
          subscriberCountText: formatLargeNumber(
            rawChannelData.statistics?.subscriberCount || 0
          ),
          videoCountText: formatLargeNumber(
            rawChannelData.statistics?.videoCount || 0
          ),
          viewCountText: formatLargeNumber(
            rawChannelData.statistics?.viewCount || 0
          ),
          publishedDate: new Date(
            rawChannelData.snippet.publishedAt
          ).toLocaleDateString(),
          channelAge: calculateChannelAge(rawChannelData.snippet.publishedAt),
        },
        urls: {
          channel: `https://www.youtube.com/channel/${rawChannelData.id}`,
          customUrl: rawChannelData.snippet.customUrl
            ? `https://www.youtube.com/${rawChannelData.snippet.customUrl}`
            : null,
        },
        analysis: {
          averageViewsPerVideo: Math.round(
            (rawChannelData.statistics?.viewCount || 0) /
              (rawChannelData.statistics?.videoCount || 1)
          ),
          subscriberEngagement: calculateSubscriberEngagement(
            rawChannelData.statistics
          ),
          channelPerformance: analyzeChannelPerformance(
            rawChannelData.statistics
          ),
          contentFrequency: calculateContentFrequency(
            rawChannelData.snippet.publishedAt,
            rawChannelData.statistics?.videoCount
          ),
        },
        contentDetails: rawChannelData.contentDetails,
        isOwnChannel: true,
        // Keep original data for compatibility
        snippet: rawChannelData.snippet,
        originalStatistics: rawChannelData.statistics,
      };

      res.json({
        success: true,
        data: enhancedChannelData,
        message: "Your channel analyzed successfully",
      });
    } catch (error) {
      console.error("❌ Channel analysis error:", {
        message: error.message,
        code: error.code,
        status: error.status,
        response: error.response?.data,
      });

      if (
        error.code === 401 ||
        error.message.includes("invalid_grant") ||
        error.message.includes("Invalid Credentials")
      ) {
        return res.status(401).json({
          success: false,
          message:
            "YouTube authentication expired. Please reconnect your YouTube account.",
        });
      }

      if (error.code === 403) {
        return res.status(403).json({
          success: false,
          message:
            "Access forbidden. Please check your YouTube API permissions.",
        });
      }

      res.status(500).json({
        success: false,
        message: `Failed to analyze channel: ${error.message}`,
        error: error.message,
      });
    }
  },
};

module.exports = youtubeController;
