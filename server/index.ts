import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
// if web app, use .env.web
dotenv.config();


const app = express();
const PORT = parseInt(process.env.PORT || "6000", 10);

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "exp://localhost:8081",
      "http://localhost:19006",
      // Add additional origins as needed
      "exp://192.168.1.1:8081", // Example local network
      "http://192.168.1.1:8081", // Example local network
    ],
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection
let cachedConnection: typeof mongoose | null = null;

export async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Initialize database connection
connectDB().catch(console.error);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// API Routes
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to Mindful Meals API" });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  }
);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
