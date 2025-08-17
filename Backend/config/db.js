const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// dotenv.config();
const connectToDb = async () => {
  try {
    await mongoose.connect(process.env.MONGOURI);
    console.log("connected to mongoDB");
  } catch {
    console.log("failed to connect mongoDB");
  }
};
module.exports = connectToDb;
