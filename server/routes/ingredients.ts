import express, { Router, RequestHandler } from 'express';
import Ingredient from '../models/Ingredient';

const router: Router = express.Router();

interface SearchQuery {
  query?: string;
}

interface IdParam {
  id: string;
}

// Get all ingredients
const getAllIngredients: RequestHandler = async (_req, res) => {
  try {
    const ingredients = await Ingredient.find({});
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ingredients', error });
  }
};

// Search ingredients
const searchIngredients: RequestHandler<{}, {}, {}, SearchQuery> = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      res.status(400).json({ message: 'Search query is required' });
      return;
    }

    const ingredients = await Ingredient.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });

    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Error searching ingredients', error });
  }
};

// Get ingredient by ID
const getIngredientById: RequestHandler<IdParam> = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      res.status(404).json({ message: 'Ingredient not found' });
      return;
    }
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ingredient', error });
  }
};

// Create new ingredient
const createIngredient: RequestHandler = async (req, res) => {
  try {
    const ingredient = new Ingredient(req.body);
    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(400).json({ message: 'Error creating ingredient', error });
  }
};

// Update ingredient
const updateIngredient: RequestHandler<IdParam> = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ingredient) {
      res.status(404).json({ message: 'Ingredient not found' });
      return;
    }
    res.json(ingredient);
  } catch (error) {
    res.status(400).json({ message: 'Error updating ingredient', error });
  }
};

// Delete ingredient
const deleteIngredient: RequestHandler<IdParam> = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndDelete(req.params.id);
    if (!ingredient) {
      res.status(404).json({ message: 'Ingredient not found' });
      return;
    }
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ingredient', error });
  }
};

router.get('/', getAllIngredients);
router.get('/search', searchIngredients);
router.get('/:id', getIngredientById);
router.post('/', createIngredient);
router.put('/:id', updateIngredient);
router.delete('/:id', deleteIngredient);

export default router; 