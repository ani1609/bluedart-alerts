import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("MongoDB already connected");
      return;
    }

    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit the process with failure
  }
};
