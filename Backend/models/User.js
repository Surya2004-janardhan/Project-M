const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  channelLink: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  previousData: {
    type: Array,
    default: [],
  },
  oauthData: {
    type: Object,
    default: {},
  },
  channelData: {
    type: Object,
    default: {},
  },
  commentsData: {
    type: Array,
    default: [],
  },
  role: {
    type: String,
    default: "user", // Default role is 'user'
    enum: ["user", "admin"], // Only 'user' and 'admin' roles
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;