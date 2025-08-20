const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Auth Controller
const authController = {
  // Login endpoint
  login: async (req, res) => {
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

      // Generate simple JWT token
      const generateAuthToken = (email, userId, name) => {
        return jwt.sign(
          {
            email: email,
            id: userId,
            name: name,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h", // 24 hour token
          }
        );
      };

      const token = generateAuthToken(email, user._id, user.name);

      res.status(200).json({
        token,
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
  },

  // Signup endpoint
  signup: async (req, res) => {
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
  },
};

module.exports = authController;
