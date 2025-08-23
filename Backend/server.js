const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const helmet = require("helmet");

require("dotenv").config({ override: true });
const connectToDb = require("./config/db");
connectToDb();

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const oauthRoutes = require("./routes/oauthRoutes");
const youtubeRoutes = require("./routes/youtubeRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Home route
app.get("/", (req, res) => {
  res.send("Hy admin , this is our server home route!");
});

// Use routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/oauth", oauthRoutes);
app.use("/youtube", youtubeRoutes);
app.use("/", adminRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
