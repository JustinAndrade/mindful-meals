import { connect, disconnect, Connection, set } from "mongoose";
import Constants from "expo-constants";
import { Platform } from 'react-native';

// Import models
import UserProfile from "../models/UserProfile";
import Ingredient from "../models/Ingredient";

// Disable Mongoose strict query warning
if (Platform.OS === 'web') {
  set('strictQuery', false);
}

let cachedConnection: Connection | null = null;

async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  // Get MongoDB URI from environment variables
  const MONGODB_URI = Platform.OS === 'web' 
    ? process.env.MONGODB_URI 
    : Constants.expoConfig?.extra?.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable"
    );
  }

  try {
    // For React Native, we'll use a more basic configuration
    const options = Platform.OS === 'web' ? {
      autoIndex: true,
      minPoolSize: 5,
      maxPoolSize: 10,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    } : {
      autoIndex: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    const connection = await connect(MONGODB_URI, options);
    console.log("Connected to MongoDB");
    cachedConnection = connection.connection;
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

async function disconnectDB() {
  if (cachedConnection) {
    await disconnect();
    cachedConnection = null;
    console.log("Disconnected from MongoDB");
  }
}

const mongodb = {
  connectDB,
  disconnectDB,
  UserProfile,
  Ingredient,
};

export default mongodb;
export { connectDB, disconnectDB, UserProfile, Ingredient }; 