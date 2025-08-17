const mongoose = require("mongoose");

export default connectToDb = async () => {
  try {
    await mongoose.connect(process.env.mongoURI);
    console.log("connected to mongoDB");
  } catch {
    console.log("failed to connect mongoDB");
  }
};
