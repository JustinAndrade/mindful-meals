import express, { RequestHandler } from "express";
import UserProfile from "../models/UserProfile";

const router = express.Router();

interface ProfileRequestBody {
  userId: string;
  email: string;
  displayName?: string;
  dietaryGoals: {
    type: "weight_loss" | "bulking" | "maintenance";
    targetCalories?: number;
    targetProtein?: number;
    targetCarbs?: number;
    targetFat?: number;
  };
  preferences: {
    dietaryRestrictions: string[];
    allergies?: string[];
    dislikedIngredients?: string[];
    favoriteIngredients: string[];
  };
}

interface ProfileParams {
  userId: string;
}

// Create or update profile
const createProfile: RequestHandler<{}, {}, ProfileRequestBody> = async (req, res) => {
  try {
    const { userId, email, displayName, dietaryGoals, preferences } = req.body;

    if (!userId || !email) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Create or update user profile
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      {
        email,
        displayName,
        dietaryGoals,
        preferences,
      },
      { upsert: true, new: true }
    );

    res.json(profile);
  } catch (error) {
    console.error("Profile creation error:", error);
    res.status(500).json({ error: "Failed to create profile" });
  }
};

// Get profile by userId
const getProfile: RequestHandler<ProfileParams> = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

router.post("/", createProfile);
router.get("/:userId", getProfile);

export default router; 
