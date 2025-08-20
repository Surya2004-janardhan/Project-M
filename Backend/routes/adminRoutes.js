const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const middleware = require("../middleware/authMiddleware");

// Admin routes
router.get("/user/admin/", middleware, adminController.getAdminDashboard);
router.get("/user/admin/users", middleware, adminController.getAllUsers);
router.get(
  "/user/admin/user/:id",
  middleware,
  adminController.getUserByIdAdmin
);

module.exports = router;
