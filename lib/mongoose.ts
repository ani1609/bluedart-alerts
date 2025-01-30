import mongoose from "mongoose";

// Ensure the DATABASE_URL environment variable is defined
export const connectDb = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is not defined in the environment variables."
    );
  }

  // If the connection is already established, no need to reconnect
  if (mongoose.connection.readyState >= 1) {
    console.log("MongoDB is already connected.");
    return;
  }

  try {
    // Connect to the MongoDB database (no need for useNewUrlParser and useUnifiedTopology anymore)
    await mongoose.connect(dbUrl);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if there's a database connection error
  }
};
