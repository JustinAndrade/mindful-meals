import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
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
    allergies: string[];
    dislikedIngredients: string[];
    favoriteIngredients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    displayName: { type: String },
    dietaryGoals: {
      type: {
        type: String,
        enum: ["weight_loss", "bulking", "maintenance"],
        required: true,
      },
      targetCalories: { type: Number },
      targetProtein: { type: Number },
      targetCarbs: { type: Number },
      targetFat: { type: Number },
    },
    preferences: {
      dietaryRestrictions: [{ type: String }],
      allergies: [{ type: String }],
      dislikedIngredients: [{ type: String }],
      favoriteIngredients: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.UserProfile ||
  mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
