const mongoose = require("mongoose");
const User = require("../models/User");

// Admin Controller
const adminController = {
  // Get admin dashboard
  getAdminDashboard: async (req, res) => {
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
  },

  // Get all users (admin only)
  getAllUsers: async (req, res) => {
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
  },

  // Get specific user by ID (admin only)
  getUserByIdAdmin: async (req, res) => {
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
  },
};

module.exports = adminController;
