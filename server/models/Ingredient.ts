import mongoose, { Schema, Document } from "mongoose";

export interface DbIngredient extends Document {
  name: string;
  category: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
  };
  seasonality?: string[];
  commonAllergies?: string[];
  dietaryCategories: string[]; // e.g., ["vegan", "vegetarian", "gluten-free"]
  substitutes?: string[]; // IDs of other ingredients that can be substituted
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    category: [{ type: String, required: true }],
    nutritionalInfo: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
      fiber: { type: Number },
      vitamins: { type: Map, of: Number },
      minerals: { type: Map, of: Number },
    },
    seasonality: [{ type: String }],
    commonAllergies: [{ type: String }],
    dietaryCategories: [{ type: String, required: true }],
    substitutes: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
IngredientSchema.index({ name: 'text', category: 'text' });

export default mongoose.model<DbIngredient>("Ingredient", IngredientSchema); 