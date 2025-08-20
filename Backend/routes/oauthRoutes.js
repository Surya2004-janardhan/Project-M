const express = require("express");
const router = express.Router();
const oauthController = require("../controllers/oauthController");
const middleware = require("../middleware/authMiddleware");

// OAuth routes
router.get("/oauth/google", oauthController.initGoogleOAuth);
router.get("/oauth/google/callback", oauthController.handleGoogleCallback);
router.post("/oauth/associate", middleware, oauthController.associateOAuth);

module.exports = router;
