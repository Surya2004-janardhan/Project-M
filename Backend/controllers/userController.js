const mongoose = require("mongoose");
const User = require("../models/User");

// User Controller
const userController = {
  // Get user by ID
  getUserById: async (req, res) => {
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
  },

  // Get user previous data
  getUserPreviousData: async (req, res) => {
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
  },

  // Insert data for user
  insertUserData: async (req, res) => {
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
  },

  // Get user comments data
  getUserCommentsData: async (req, res) => {
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
  },
};

module.exports = userController;
