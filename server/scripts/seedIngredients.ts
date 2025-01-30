import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ingredient from '../models/Ingredient';

dotenv.config();

const ingredients = [
  {
    name: 'Chicken Breast',
    category: ['Protein', 'Meat'],
    nutritionalInfo: {
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    },
    dietaryCategories: ['high-protein', 'low-carb'],
  },
  {
    name: 'Quinoa',
    category: ['Grains', 'Plant-Based'],
    nutritionalInfo: {
      calories: 120,
      protein: 4.4,
      carbs: 21.3,
      fat: 1.9,
      fiber: 2.8,
    },
    dietaryCategories: ['vegetarian', 'vegan', 'gluten-free'],
  },
  {
    name: 'Sweet Potato',
    category: ['Vegetables', 'Starchy Vegetables'],
    nutritionalInfo: {
      calories: 103,
      protein: 2,
      carbs: 23.6,
      fat: 0.2,
      fiber: 3.8,
    },
    dietaryCategories: ['vegetarian', 'vegan', 'paleo'],
  },
  {
    name: 'Salmon',
    category: ['Protein', 'Fish'],
    nutritionalInfo: {
      calories: 208,
      protein: 22,
      carbs: 0,
      fat: 13,
    },
    dietaryCategories: ['pescatarian', 'keto', 'high-protein'],
  },
  {
    name: 'Avocado',
    category: ['Fruits', 'Healthy Fats'],
    nutritionalInfo: {
      calories: 160,
      protein: 2,
      carbs: 8.5,
      fat: 14.7,
      fiber: 6.7,
    },
    dietaryCategories: ['vegetarian', 'vegan', 'keto'],
  },
  // Add more ingredients as needed
];

async function seedIngredients() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing ingredients
    await Ingredient.deleteMany({});
    console.log('Cleared existing ingredients');

    // Insert new ingredients
    const result = await Ingredient.insertMany(ingredients);
    console.log(`Seeded ${result.length} ingredients`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding ingredients:', error);
    process.exit(1);
  }
}

seedIngredients(); 