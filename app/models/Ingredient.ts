import mongoose, { Schema, Document } from "mongoose";

export interface IIngredient extends Document {
  name: string;
  category: string;
  nutritionPer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  commonPortionSize: {
    amount: number;
    unit: string;
  };
  dietaryInfo: {
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
  };
  seasonality?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      required: true,
      enum: [
        "protein",
        "vegetable",
        "fruit",
        "grain",
        "dairy",
        "seasoning",
        "other",
      ],
      index: true,
    },
    nutritionPer100g: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
      fiber: { type: Number },
    },
    commonPortionSize: {
      amount: { type: Number, required: true },
      unit: { type: String, required: true },
    },
    dietaryInfo: {
      isVegetarian: { type: Boolean, default: false, index: true },
      isVegan: { type: Boolean, default: false, index: true },
      isGlutenFree: { type: Boolean, default: false, index: true },
      isDairyFree: { type: Boolean, default: false },
    },
    seasonality: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models?.Ingredient ||
  mongoose.model<IIngredient>("Ingredient", IngredientSchema);
