const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const helmet = require("helmet");
// const mongoSanitize = require("express-mongo-sanitize");
const { google } = require("googleapis");

require("dotenv").config({ override: true });
const User = require("./models/User"); // Adjust the path as necessary
const connectToDb = require("./config/db");
connectToDb();
const middleware = require("./middleware/authMiddleware"); // Adjust the path as necessary

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(mongoSanitize());

app.get("/", (req, res) => {
  res.send("Hy admin , this is our server home route!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Account does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentails" });
    }
    
    // Generate tokens
    const generateAccessToken = (email, userId) => {
      return jwt.sign({ email: email, id: userId }, process.env.JWT_SECRET, {
        expiresIn: "15m", // Short-lived access token
      });
    };

    const generateRefreshToken = (email, userId) => {
      return jwt.sign({ email: email, id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Long-lived refresh token
      });
    };

    const accessToken = generateAccessToken(email, user._id);
    const refreshToken = generateRefreshToken(email, user._id);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS in production
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Refresh token endpoint
app.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Generate new access token
    const generateAccessToken = (email, userId) => {
      return jwt.sign({ email: email, id: userId }, process.env.JWT_SECRET, {
        expiresIn: "15m",
      });
    };

    const newAccessToken = generateAccessToken(user.email, user._id);

    res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.clearCookie("refreshToken");
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// Logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});

app.post("/singup", async (req, res) => {
  try {
    const { name, channelLink, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Account with same email exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      channelLink,
      email,
      password: hashedPassword,
      previousData: [],
      oauthData: {},
      channelData: {},
      commentsData: [],
      role: "user", // Default role is 'user'
    });
    await newUser.save();
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/user/:id", middleware, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    // Assuming userId is the ID of the user to fetch
    // If you want to use req.user from the middleware, you can access it like this
    // const userId = req.user.id; // If you want to get the user ID from the token
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    // Fetch the user from the database
    // If you want to use req.user from the middleware, you can access it like this
    // const userId = req.user.id; // If you want to get the user ID from the token
    // const user = await User.findById(userId);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      name: user.name,
      channelLink: user.channelLink,
      email: user.email,
      previousData: user.previousData || [],
      oauthData: user.oauthData || {},
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/user/previous/:id", middleware, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      previousData: user.previousData || [],
      message: "Previous user data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching previous user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.post("/user/insertData/:id", middleware, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid data format" });
    }
    user.previousData.push(...data);
    await user.save();
    res.status(200).json({
      message: "Data inserted successfully",
      previousData: user.previousData,
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// oauth gmail integration for user inside the side so that youtube can be accessed to them using API
app.get("/oauth/google", (req, res) => {
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
});

app.get("/oauth/google/callback", async (req, res) => {
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
});

// New endpoint to associate OAuth data with logged-in user
app.post("/oauth/associate", middleware, async (req, res) => {
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
});
// takes youutube channel link and returns the channel id
app.post("/youtube/channelId", middleware, async (req, res) => {
  try {
    const { channelLink } = req.body;
    if (!channelLink) {
      return res.status(400).json({ message: "Channel link is required" });
    }
    const regex =
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:channel\/|c\/|user\/)?([^/?]+)/;
    const match = channelLink.match(regex);
    if (!match || match.length < 2) {
      return res.status(400).json({ message: "Invalid YouTube channel link" });
    }
    const channelId = match[1];
    res.status(200).json({ channelId });
  } catch (error) {
    console.error("Error extracting channel ID:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// with channel id it returns the channel data
app.post("/youtube/channelData", middleware, async (req, res) => {
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
});
// takes a vedio link and return the video id
app.post("/youtube/videoId", middleware, async (req, res) => {
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
});

// takes a video id and returns the video data
app.post("/youtube/videoData", middleware, async (req, res) => {
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
});
// fetched comments and auto replies to the comments with a msg called thank you and also saves how many comments are replied to this particular vedio in db under commentsData

app.post("/youtube/comments", middleware, async (req, res) => {
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
});
// llm logic where it takes the vedio context from user writeen + transacript and also takes current comment of user finds the best most suitable reply to that comment and gives back so that this is used now
app.post("/youtube/llmReply", middleware, async (req, res) => {
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
});

// user usage of all the comments for all the vedious just res the object with vedioid with no of comments replied
app.get("/user/commentsData/:id", middleware, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      commentsData: user.commentsData || [],
      message: "Comments data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching comments data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/user/admin/", middleware, async (req, res) => {
  try {
    const userEmail = req.user.email; // Get the user from the middleware
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    res.status(200).json({ message: "Welcome Admin", user });
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/user/admin/users", middleware, async (req, res) => {
  try {
    const userEmail = req.user.email; // Get the user from the middleware
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    const allUsers = await User.find({}, "-password"); // Exclude password field
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.get("/user/admin/user/:id", middleware, async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }
    const userEmail = req.user.email; // Get the user from the middleware
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    const targetUser = await User.findById(userId, "-password"); // Exclude password field
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }
    res.status(200).json(targetUser);
  } catch (error) {
    console.error("Error fetching target user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
