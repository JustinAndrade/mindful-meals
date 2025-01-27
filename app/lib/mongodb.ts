import mongoose from "mongoose";
import Constants from "expo-constants";

const MONGODB_URI = Constants.expoConfig?.extra?.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    isConnected = false;
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
};

export const getConnectionStatus = () => isConnected;

export default { connectDB, disconnectDB, getConnectionStatus };
