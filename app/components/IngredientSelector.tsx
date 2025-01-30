import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { debounce } from 'lodash';
import { API_URL } from '../config/api';

interface Ingredient {
  _id: string;
  name: string;
  category: string[];
  dietaryCategories: string[];
}

// Default ingredients to show while backend is not ready
const DEFAULT_INGREDIENTS: Ingredient[] = [
  {
    _id: '1',
    name: 'Chicken Breast',
    category: ['Protein', 'Meat'],
    dietaryCategories: ['high-protein', 'low-carb'],
  },
  {
    _id: '2',
    name: 'Salmon',
    category: ['Protein', 'Fish'],
    dietaryCategories: ['high-protein', 'omega-3'],
  },
  {
    _id: '3',
    name: 'Quinoa',
    category: ['Grains'],
    dietaryCategories: ['vegetarian', 'gluten-free'],
  },
  {
    _id: '4',
    name: 'Sweet Potato',
    category: ['Vegetables'],
    dietaryCategories: ['vegetarian', 'complex-carbs'],
  },
  {
    _id: '5',
    name: 'Avocado',
    category: ['Fruits', 'Healthy Fats'],
    dietaryCategories: ['vegetarian', 'healthy-fats'],
  },
  {
    _id: '6',
    name: 'Spinach',
    category: ['Vegetables', 'Leafy Greens'],
    dietaryCategories: ['vegetarian', 'low-calorie'],
  },
  {
    _id: '7',
    name: 'Greek Yogurt',
    category: ['Dairy', 'Protein'],
    dietaryCategories: ['high-protein', 'probiotic'],
  },
  {
    _id: '8',
    name: 'Almonds',
    category: ['Nuts', 'Healthy Fats'],
    dietaryCategories: ['vegetarian', 'healthy-fats'],
  },
];

interface IngredientSelectorProps {
  onSelect: (ingredient: Ingredient) => void;
  onRemove: (ingredientId: string) => void;
  selectedIngredients: Ingredient[];
  placeholder?: string;
}

export default function IngredientSelector({
  onSelect,
  onRemove,
  selectedIngredients,
  placeholder = 'Search ingredients...',
}: IngredientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>(DEFAULT_INGREDIENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { colors } = useTheme();

  // Fetch all ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch(`${API_URL}/ingredients`);
      if (!response.ok) {
        // If the API fails, we'll continue using the default ingredients
        console.warn('Using default ingredients');
        return;
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setIngredients(data);
        setFilteredIngredients(data);
      }
    } catch (error) {
      console.warn('Using default ingredients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredIngredients(ingredients);
      return;
    }

    const searchTerms = text.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const filtered = ingredients.filter(ingredient => {
      const name = ingredient.name.toLowerCase();
      const categories = ingredient.category.join(' ').toLowerCase();
      
      return searchTerms.every(term => 
        name.includes(term) || categories.includes(term)
      );
    });
    
    setFilteredIngredients(filtered);
  };

  const handleSelect = (ingredient: Ingredient) => {
    if (!selectedIngredients.some(item => item._id === ingredient._id)) {
      onSelect(ingredient);
    }
  };

  const renderItem = ({ item }: { item: Ingredient }) => {
    const isSelected = selectedIngredients.some(selected => selected._id === item._id);
    
    return (
      <TouchableOpacity
        style={[
          styles.resultItem,
          isSelected && styles.selectedResultItem
        ]}
        onPress={() => handleSelect(item)}
      >
        <View style={styles.resultContent}>
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemCategory, { color: colors.text }]}>
              {item.category.join(', ')}
            </Text>
          </View>
          <View style={styles.checkboxContainer}>
            {isSelected ? (
              <View style={styles.selectedIndicator}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            ) : (
              <View style={styles.unselectedIndicator} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSelectedIngredients = () => (
    <View style={styles.selectedContainer}>
      {selectedIngredients.map((item) => (
        <View key={item._id} style={styles.selectedItem}>
          <Text style={[styles.selectedItemText, { color: colors.text }]}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={() => onRemove(item._id)}>
            <Text style={styles.removeButton}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Ingredients</Text>
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              { backgroundColor: colors.card, color: colors.text },
            ]}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder={placeholder}
            placeholderTextColor={colors.text}
            autoFocus
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredIngredients}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            style={styles.modalList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No ingredients found
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchIngredients}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.searchButton, { backgroundColor: colors.card }]}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={[styles.searchButtonText, { color: colors.text }]}>
          {placeholder}
        </Text>
      </TouchableOpacity>

      {renderSelectedIngredients()}
      {renderModal()}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
  },
  searchButton: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchButtonText: {
    fontSize: 16,
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  modalList: {
    flex: 1,
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedResultItem: {
    backgroundColor: '#f0f0f0',
  },
  resultContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unselectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 40,
    marginTop: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedItemText: {
    marginRight: 6,
  },
  removeButton: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  emptyText: {
    padding: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 
