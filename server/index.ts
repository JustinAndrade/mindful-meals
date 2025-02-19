import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import profileRoutes from "./routes/profile";
import ingredientRoutes from "./routes/ingredients";

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
      "http://10.0.0.223:8081",
      "exp://10.0.0.223:8081",
      "http://10.0.0.223:19006",
      "http://10.0.0.223:19000",
      "exp://10.0.0.223:19000",
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
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// API Routes
app.get("/api", (_req, res) => {
  res.json({ message: "Welcome to Mindful Meals API" });
});

// Mount routes
app.use("/api/profile", profileRoutes);
app.use("/api/ingredients", ingredientRoutes);

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  }
);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
