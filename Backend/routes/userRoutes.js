const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const middleware = require("../middleware/authMiddleware");

// User routes
router.get("/user/:id", middleware, userController.getUserById);
router.get(
  "/user/previous/:id",
  middleware,
  userController.getUserPreviousData
);
router.post("/user/insertData/:id", middleware, userController.insertUserData);
router.get(
  "/user/commentsData/:id",
  middleware,
  userController.getUserCommentsData
);

module.exports = router;
