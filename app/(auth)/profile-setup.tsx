import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  useColorScheme,
  PanResponder,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTheme } from '@react-navigation/native';
import IngredientSelector from '../components/IngredientSelector';
import { API_URL } from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animated as RNAnimated } from "react-native";

type DietaryGoalType = "weight_loss" | "bulking" | "maintenance";

interface Ingredient {
  _id: string;
  name: string;
  category: string[];
  dietaryCategories: string[];
}

const dietaryGoals = [
  { 
    id: 'weight_loss', 
    label: 'Weight Loss', 
    description: 'Focus on calorie deficit and lean proteins',
    icon: 'trending-down'
  },
  { 
    id: 'maintenance', 
    label: 'Maintenance', 
    description: 'Balance your nutrition and maintain weight',
    icon: 'swap-horizontal'
  },
  { 
    id: 'bulking', 
    label: 'Muscle Gain', 
    description: 'Increase protein and healthy calories',
    icon: 'trending-up'
  },
];

const dietaryRestrictions = [
  { 
    id: 'vegetarian',
    label: 'Vegetarian',
    icon: '🥗',
    options: ['Lacto', 'Ovo', 'Lacto-Ovo']
  },
  { 
    id: 'vegan',
    label: 'Vegan',
    icon: '🌱',
    options: ['Raw', 'Whole-Food', 'Junk-Food']
  },
  { 
    id: 'keto',
    label: 'Keto',
    icon: '🥑',
    options: ['Strict', 'Moderate', 'Cyclical']
  },
  { 
    id: 'gluten_free',
    label: 'Gluten Free',
    icon: '🌾',
    options: ['Celiac', 'Sensitivity', 'By Choice']
  },
  { 
    id: 'dairy_free',
    label: 'Dairy Free',
    icon: '🥛',
    options: ['Lactose', 'Casein', 'All Dairy']
  },
  { 
    id: 'paleo',
    label: 'Paleo',
    icon: '🍖',
    options: ['Strict', 'Primal', 'AIP']
  },
  { 
    id: 'halal',
    label: 'Halal',
    icon: '🌙',
    options: ['Strict', 'Moderate', 'Cultural']
  },
  { 
    id: 'kosher',
    label: 'Kosher',
    icon: '✡️',
    options: ['Strict', 'Moderate', 'Cultural']
  },
  { 
    id: 'low_carb',
    label: 'Low Carb',
    icon: '🥩',
    options: ['Very Low', 'Moderate', 'Flexible']
  },
  {
    id: 'mediterranean',
    label: 'Mediterranean',
    icon: '🫒',
    options: ['Traditional', 'Modern', 'Pescatarian']
  },
  {
    id: 'fodmap',
    label: 'Low FODMAP',
    icon: '🍎',
    options: ['Strict', 'Reintro', 'Maintenance']
  },
  {
    id: 'diabetic',
    label: 'Diabetic',
    icon: '📊',
    options: ['Type 1', 'Type 2', 'Gestational']
  },
  {
    id: 'pescatarian',
    label: 'Pescatarian',
    icon: '🐟',
    options: ['Fish Only', 'With Eggs', 'With Dairy']
  },
  {
    id: 'whole30',
    label: 'Whole30',
    icon: '🥬',
    options: ['First Time', 'Reintro', 'Lifestyle']
  },
  {
    id: 'autoimmune',
    label: 'AIP',
    icon: '🌿',
    options: ['Elimination', 'Reintro', 'Maintenance']
  },
  {
    id: 'raw_food',
    label: 'Raw Food',
    icon: '🥕',
    options: ['100%', '75%', 'High Raw']
  },
  {
    id: 'alkaline',
    label: 'Alkaline',
    icon: '🥝',
    options: ['Strict', 'Flexible', '80/20']
  },
  {
    id: 'carnivore',
    label: 'Carnivore',
    icon: '🥩',
    options: ['Lion', 'Standard', 'Modified']
  }
];

type Step = 'name' | 'goal' | 'restrictions' | 'favorites' | 'avoid';

const stepInfo = {
  name: {
    label: 'Name',
    icon: 'person-outline' as const,
    required: true
  },
  goal: {
    label: 'Goal',
    icon: 'trophy-outline' as const,
    required: true
  },
  restrictions: {
    label: 'Diet',
    icon: 'restaurant-outline' as const,
    required: false
  },
  favorites: {
    label: 'Favorites',
    icon: 'heart-outline' as const,
    required: false
  },
  avoid: {
    label: 'Avoid',
    icon: 'close-circle-outline' as const,
    required: false
  }
};

const dietaryInfo: Record<string, {
  description: string;
  benefits: string[];
  considerations: string[];
  commonFoods: string[];
}> = {
  vegetarian: {
    description: 'A diet that excludes meat, fish, and poultry but may include dairy products and eggs.',
    benefits: ['Lower cholesterol', 'Reduced environmental impact', 'Heart health'],
    considerations: ['Protein sources', 'Vitamin B12', 'Iron intake'],
    commonFoods: ['Legumes', 'Dairy', 'Eggs', 'Tofu', 'Tempeh']
  },
  vegan: {
    description: 'A plant-based diet excluding all animal products including dairy, eggs, and honey.',
    benefits: ['Lower carbon footprint', 'Reduced inflammation', 'Heart health'],
    considerations: ['B12 supplementation', 'Protein combining', 'Omega-3 sources'],
    commonFoods: ['Legumes', 'Nuts', 'Seeds', 'Whole grains', 'Vegetables']
  },
  keto: {
    description: 'A high-fat, very-low-carbohydrate diet that puts your body into ketosis.',
    benefits: ['Weight loss', 'Mental clarity', 'Blood sugar control'],
    considerations: ['Electrolyte balance', 'Fiber intake', 'Transition period'],
    commonFoods: ['Avocados', 'Eggs', 'Fatty fish', 'Nuts', 'Oils']
  },
  gluten_free: {
    description: 'A diet that excludes gluten, a protein found in wheat, barley, and rye.',
    benefits: ['Reduced inflammation', 'Better digestion', 'Increased energy'],
    considerations: ['Cross-contamination', 'Hidden sources of gluten', 'Nutrient balance'],
    commonFoods: ['Rice', 'Quinoa', 'Corn', 'Potatoes', 'Gluten-free oats']
  },
  dairy_free: {
    description: 'A diet that excludes all dairy products including milk, cheese, yogurt, and butter.',
    benefits: ['Better digestion', 'Clearer skin', 'Reduced inflammation'],
    considerations: ['Calcium sources', 'Vitamin D', 'Protein alternatives'],
    commonFoods: ['Plant-based milk', 'Nutritional yeast', 'Leafy greens', 'Nuts', 'Seeds']
  },
  paleo: {
    description: 'A diet based on foods similar to what might have been eaten during the Paleolithic era.',
    benefits: ['Weight management', 'Blood sugar control', 'Reduced inflammation'],
    considerations: ['Meal planning', 'Cost', 'Social situations'],
    commonFoods: ['Lean meats', 'Fish', 'Fruits', 'Vegetables', 'Nuts and seeds']
  },
  halal: {
    description: 'Food permitted under Islamic dietary guidelines, focusing on both ingredients and preparation methods.',
    benefits: ['Ethical sourcing', 'Clean eating', 'Community connection'],
    considerations: ['Certification', 'Cross-contamination', 'Availability'],
    commonFoods: ['Halal meat', 'Seafood', 'Vegetables', 'Fruits', 'Grains']
  },
  kosher: {
    description: 'Food that adheres to Jewish dietary laws (kashrut), including specific preparation methods.',
    benefits: ['Quality control', 'Ethical consumption', 'Traditional values'],
    considerations: ['Certification', 'Separate meat/dairy', 'Availability'],
    commonFoods: ['Kosher meat', 'Pareve foods', 'Fruits', 'Vegetables', 'Grains']
  },
  low_carb: {
    description: 'A diet that restricts carbohydrate intake, typically focusing on protein and healthy fats.',
    benefits: ['Weight management', 'Blood sugar control', 'Reduced cravings'],
    considerations: ['Fiber intake', 'Energy levels', 'Sustainable choices'],
    commonFoods: ['Meat', 'Fish', 'Low-carb vegetables', 'Eggs', 'Cheese']
  },
  mediterranean: {
    description: 'A diet based on traditional foods eaten in Mediterranean countries.',
    benefits: ['Heart health', 'Brain function', 'Longevity'],
    considerations: ['Portion control', 'Quality of oils', 'Fresh ingredients'],
    commonFoods: ['Olive oil', 'Fish', 'Whole grains', 'Vegetables', 'Legumes']
  },
  fodmap: {
    description: 'A diet low in fermentable carbohydrates, designed to help manage IBS and digestive issues.',
    benefits: ['Reduced bloating', 'Better digestion', 'Symptom management'],
    considerations: ['Reintroduction phase', 'Nutritional balance', 'Menu planning'],
    commonFoods: ['Rice', 'Certain vegetables', 'Certain fruits', 'Meat', 'Fish']
  },
  diabetic: {
    description: 'A diet designed to help manage blood sugar levels and maintain healthy weight.',
    benefits: ['Blood sugar control', 'Weight management', 'Heart health'],
    considerations: ['Carb counting', 'Meal timing', 'Portion control'],
    commonFoods: ['Lean proteins', 'Non-starchy vegetables', 'Whole grains', 'Healthy fats']
  },
  pescatarian: {
    description: 'A diet that includes fish but excludes other forms of meat and poultry.',
    benefits: ['Heart health', 'Brain function', 'Environmental impact'],
    considerations: ['Mercury levels', 'Sustainable sourcing', 'Omega-3 balance'],
    commonFoods: ['Fish', 'Shellfish', 'Vegetables', 'Legumes', 'Whole grains']
  },
  whole30: {
    description: 'A 30-day diet that eliminates sugar, alcohol, grains, legumes, soy, and dairy.',
    benefits: ['Reset eating habits', 'Identify sensitivities', 'Improved energy'],
    considerations: ['Meal prep', 'Social situations', 'Reintroduction phase'],
    commonFoods: ['Meat', 'Fish', 'Eggs', 'Vegetables', 'Fruits']
  },
  autoimmune: {
    description: 'A protocol designed to help reduce inflammation and autoimmune symptoms.',
    benefits: ['Reduced inflammation', 'Symptom management', 'Gut health'],
    considerations: ['Nutrient density', 'Elimination phase', 'Reintroductions'],
    commonFoods: ['Organ meats', 'Bone broth', 'Vegetables', 'Berries', 'Coconut']
  },
  raw_food: {
    description: 'A diet consisting of uncooked, unprocessed, and often organic foods.',
    benefits: ['Enzyme preservation', 'Nutrient density', 'Environmental impact'],
    considerations: ['Food safety', 'Preparation time', 'Equipment needed'],
    commonFoods: ['Fresh fruits', 'Raw vegetables', 'Nuts', 'Seeds', 'Sprouts']
  },
  alkaline: {
    description: 'A diet based on the idea of reducing acidic foods to help maintain optimal pH balance.',
    benefits: ['Increased energy', 'Better digestion', 'Mineral balance'],
    considerations: ['Food combining', 'pH testing', 'Transition period'],
    commonFoods: ['Green vegetables', 'Almonds', 'Citrus fruits', 'Herbs', 'Quinoa']
  },
  carnivore: {
    description: 'A diet consisting entirely of animal products, excluding all plant foods.',
    benefits: ['Simplified eating', 'Protein intake', 'Zero carb'],
    considerations: ['Nutrient balance', 'Fiber intake', 'Social situations'],
    commonFoods: ['Beef', 'Organ meats', 'Fish', 'Eggs', 'Bone broth']
  }
};

interface DietInfoModalProps {
  diet: string | null;
  visible: boolean;
  onClose: () => void;
}

const DietInfoModal = ({ diet, visible, onClose }: DietInfoModalProps) => {
  if (!diet || !dietaryInfo[diet as keyof typeof dietaryInfo]) return null;
  
  const info = dietaryInfo[diet as keyof typeof dietaryInfo];
  const restriction = dietaryRestrictions.find(d => d.id === diet);
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalIcon}>{restriction?.icon}</Text>
              <Text style={styles.modalTitle}>
                {restriction?.label}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="rgba(0, 0, 0, 0.5)" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalDescriptionContainer}>
              <Text style={styles.modalDescription}>{info.description}</Text>
            </View>
            
            <View style={styles.modalSection}>
              <View style={styles.modalSectionHeader}>
                <Ionicons name="star" size={20} color="#007AFF" />
                <Text style={styles.modalSectionTitle}>Benefits</Text>
              </View>
              {info.benefits.map((benefit, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bulletDotContainer}>
                    <View style={styles.bulletDot} />
                  </View>
                  <Text style={styles.bulletText}>{benefit}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.modalSection}>
              <View style={styles.modalSectionHeader}>
                <Ionicons name="information-circle" size={20} color="#007AFF" />
                <Text style={styles.modalSectionTitle}>Key Considerations</Text>
              </View>
              {info.considerations.map((consideration, index) => (
                <View key={index} style={styles.bulletPoint}>
                  <View style={styles.bulletDotContainer}>
                    <View style={styles.bulletDot} />
                  </View>
                  <Text style={styles.bulletText}>{consideration}</Text>
                </View>
              ))}
            </View>
            
            <View style={[styles.modalSection, styles.modalSectionLast]}>
              <View style={styles.modalSectionHeader}>
                <Ionicons name="nutrition" size={20} color="#007AFF" />
                <Text style={styles.modalSectionTitle}>Common Foods</Text>
              </View>
              <View style={styles.foodTagsContainer}>
                {info.commonFoods.map((food, index) => (
                  <View key={index} style={styles.foodTag}>
                    <Text style={styles.foodTagText}>{food}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function ProfileSetupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [displayName, setDisplayName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<DietaryGoalType>("maintenance");
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [favoriteIngredients, setFavoriteIngredients] = useState<Ingredient[]>([]);
  const [dislikedIngredients, setDislikedIngredients] = useState<Ingredient[]>([]);
  const { colors } = useTheme();
  const [slideAnim] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(1));
  const colorScheme = useColorScheme();
  const [swipedRestriction, setSwipedRestriction] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const swipeAnim = useRef(new RNAnimated.Value(0)).current;
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;
  const [selectedInfoDiet, setSelectedInfoDiet] = useState<string | null>(null);

  const steps: Step[] = ['name', 'goal', 'restrictions', 'favorites', 'avoid'];
  const currentStepIndex = steps.indexOf(currentStep);

  const animateTransition = (direction: 'forward' | 'backward') => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === 'forward' ? -50 : 50,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handleNext = () => {
    if (currentStep === 'name' && !displayName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      animateTransition('forward');
      setCurrentStep(steps[currentStepIndex + 1]);
    } else {
      handleSaveProfile();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      animateTransition('backward');
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleSkip = () => {
    if (currentStepIndex < steps.length - 1) {
      animateTransition('forward');
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
          email: user?.email,
          displayName,
          dietaryGoals: {
            type: selectedGoal,
          },
          preferences: {
            dietaryRestrictions: selectedRestrictions,
            favoriteIngredients: favoriteIngredients.map((i) => i._id),
            dislikedIngredients: dislikedIngredients.map((i) => i._id),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      router.replace("/(tabs)" as never);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleRestriction = (restrictionId: string) => {
    setSelectedRestrictions((current) =>
      current.includes(restrictionId)
        ? current.filter((id) => id !== restrictionId)
        : [...current, restrictionId]
    );
  };

  const createPanResponder = (restrictionId: string) => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0 && gestureState.dx <= 120) {
          swipeAnim.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 60) {
          RNAnimated.spring(swipeAnim, {
            toValue: 120,
            useNativeDriver: true,
          }).start();
          setSwipedRestriction(restrictionId);
        } else {
          RNAnimated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          setSwipedRestriction(null);
        }
      },
    });

  const toggleOption = (restrictionId: string, option: string) => {
    setSelectedOptions(prev => {
      const current = prev[restrictionId] || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return {
        ...prev,
        [restrictionId]: updated
      };
    });
  };

  const handleRestrictionPress = (restrictionId: string) => {
    toggleRestriction(restrictionId);
  };

  const handleRestrictionLongPress = (restrictionId: string) => {
    setSelectedInfoDiet(restrictionId);
  };

  const renderStepIndicator = () => (
    <View style={[styles.stepIndicatorContainer, { paddingTop: insets.top }]}>
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <View key={step} style={styles.stepWrapper}>
              <View style={styles.stepIconContainer}>
                <View 
                  style={[
                    styles.stepDot,
                    isCurrent && styles.currentStepDot,
                    isCompleted && styles.completedStepDot,
                  ]}
                >
                  {(isCompleted || isCurrent) && (
                    <Ionicons
                      name={isCompleted ? "checkmark" : stepInfo[step].icon}
                      size={isCompleted ? 16 : 18}
                      color="#fff"
                    />
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.stepConnector,
                    isCompleted && styles.completedConnector
                  ]} />
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                isCurrent && styles.currentStepLabel,
                { color: colors.text }
              ]}>
                {stepInfo[step].label}
                {stepInfo[step].required && <Text style={styles.requiredIndicator}>*</Text>}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          What should we call you?
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          We'll use this to personalize your meal plans and recommendations
        </Text>
      </View>
      <View style={styles.inputSection}>
        <AuthInput
          label="Your Name"
          placeholder="Enter your name"
          value={displayName}
          onChangeText={setDisplayName}
          autoComplete="name"
          testID="name-input"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={handleNext}
          error={displayName.trim() === '' ? undefined : undefined}
        />
        <Text style={styles.inputHint}>
          This is how we'll address you in the app
        </Text>
      </View>
    </View>
  );

  const renderGoalStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          What's your main goal?
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          We'll tailor your meal suggestions to help you achieve this goal
        </Text>
      </View>
      <View style={styles.goalsContainer}>
        {dietaryGoals.map((goal) => {
          const isSelected = selectedGoal === goal.id;
          return (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalButton,
                isSelected && styles.selectedGoal,
              ]}
              onPress={() => setSelectedGoal(goal.id as DietaryGoalType)}
            >
              <View style={styles.goalContent}>
                <View style={[styles.goalIcon, isSelected && styles.selectedGoalIcon]}>
                  <Ionicons 
                    name={goal.icon as any} 
                    size={24} 
                    color={isSelected ? '#fff' : '#007AFF'} 
                  />
                </View>
                <View style={styles.goalTextContainer}>
                  <Text style={[styles.goalLabel, isSelected && styles.selectedText]}>
                    {goal.label}
                  </Text>
                  <Text style={[styles.goalDescription, isSelected && styles.selectedText]}>
                    {goal.description}
                  </Text>
                </View>
                <View style={[styles.goalRadio, isSelected && styles.selectedGoalRadio]}>
                  {isSelected && (
                    <View style={styles.goalRadioInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderRestrictionsStep = () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = dietaryRestrictions.slice(startIndex, endIndex);
    const totalPages = Math.ceil(dietaryRestrictions.length / itemsPerPage);

    const handleSwipe = (gestureState: { dx: number }) => {
      if (gestureState.dx < -50 && currentPage < totalPages - 1) {
        // Swipe left
        setCurrentPage(prev => prev + 1);
      } else if (gestureState.dx > 50 && currentPage > 0) {
        // Swipe right
        setCurrentPage(prev => prev - 1);
      }
    };

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => handleSwipe(gestureState),
    });

    return (
      <View style={styles.stepContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Any dietary preferences?
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Select any special diets or restrictions you follow
          </Text>
        </View>
        <Text style={styles.infoHint}>Tap to select, hold for more information</Text>
        <View {...panResponder.panHandlers}>
          <View style={styles.restrictionsGrid}>
            {currentItems.map((restriction) => {
              const itemPanResponder = createPanResponder(restriction.id);
              const isSelected = selectedRestrictions.includes(restriction.id);
              const isExpanded = swipedRestriction === restriction.id;

              return (
                <RNAnimated.View
                  key={restriction.id}
                  {...itemPanResponder.panHandlers}
                  style={[
                    styles.restrictionWrapper,
                    {
                      transform: [{
                        translateX: swipedRestriction === restriction.id ? swipeAnim : 0
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.restrictionButton,
                      isSelected && styles.selectedRestriction,
                    ]}
                    onPress={() => handleRestrictionPress(restriction.id)}
                    onLongPress={() => handleRestrictionLongPress(restriction.id)}
                    delayLongPress={500}
                  >
                    <Text style={styles.restrictionIcon}>{restriction.icon}</Text>
                    <Text style={[
                      styles.restrictionText,
                      isSelected && styles.selectedText,
                    ]}>
                      {restriction.label}
                    </Text>
                    {selectedOptions[restriction.id]?.length > 0 && (
                      <View style={styles.optionsBadge}>
                        <Text style={styles.optionsBadgeText}>
                          {selectedOptions[restriction.id].length}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {isExpanded && (
                    <View style={styles.optionsPanel}>
                      {restriction.options.map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.optionButton,
                            selectedOptions[restriction.id]?.includes(option) && styles.selectedOption
                          ]}
                          onPress={() => toggleOption(restriction.id, option)}
                        >
                          <Text style={[
                            styles.optionText,
                            selectedOptions[restriction.id]?.includes(option) && styles.selectedOptionText
                          ]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </RNAnimated.View>
              );
            })}
          </View>
          <View style={styles.paginationDots}>
            {Array.from({ length: totalPages }).map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentPage(index)}
              >
                <View style={[
                  styles.paginationDot,
                  currentPage === index && styles.activePaginationDot
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <DietInfoModal
          diet={selectedInfoDiet}
          visible={!!selectedInfoDiet}
          onClose={() => setSelectedInfoDiet(null)}
        />
      </View>
    );
  };

  const renderFavoritesStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          Favorite ingredients
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Choose ingredients you love and we'll include them in your meal suggestions
        </Text>
      </View>
      <IngredientSelector
        selectedIngredients={favoriteIngredients}
        onSelect={(ingredient) =>
          setFavoriteIngredients((current) => [...current, ingredient])
        }
        onRemove={(id) =>
          setFavoriteIngredients((current) =>
            current.filter((i) => i._id !== id)
          )
        }
        placeholder="Search ingredients..."
      />
    </View>
  );

  const renderAvoidStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.text }]}>
          Ingredients to avoid
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Select any ingredients you don't want in your meal plans
        </Text>
      </View>
      <IngredientSelector
        selectedIngredients={dislikedIngredients}
        onSelect={(ingredient) =>
          setDislikedIngredients((current) => [...current, ingredient])
        }
        onRemove={(id) =>
          setDislikedIngredients((current) =>
            current.filter((i) => i._id !== id)
          )
        }
        placeholder="Search ingredients to avoid..."
      />
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'name':
        return renderNameStep();
      case 'goal':
        return renderGoalStep();
      case 'restrictions':
        return renderRestrictionsStep();
      case 'favorites':
        return renderFavoritesStep();
      case 'avoid':
        return renderAvoidStep();
      default:
        return null;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const isOptionalStep = currentStep === 'restrictions' || 
                        currentStep === 'favorites' || 
                        currentStep === 'avoid';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? -insets.bottom : 0}
      >
        {renderStepIndicator()}
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.stepContent,
              { 
                transform: [{ translateX: slideAnim }],
                opacity: fadeAnim
              }
            ]}
          >
            {renderCurrentStep()}
          </Animated.View>
        </ScrollView>
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.buttonInnerContainer}>
            <View style={styles.buttonRow}>
              <View style={styles.leftButtonGroup}>
                {currentStepIndex > 0 && (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                  >
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.rightButtonGroup}>
                {isOptionalStep && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={handleSkip}
                  >
                    <Text style={[styles.skipButtonText, { color: colors.text }]}>Skip</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    currentStepIndex === steps.length - 1 && styles.completeButton,
                  ]}
                  onPress={handleNext}
                >
                  <Text style={styles.primaryButtonText}>
                    {currentStepIndex === steps.length - 1 ? 'Complete' : 'Continue'}
                  </Text>
                  {currentStepIndex < steps.length - 1 && (
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  stepIndicatorContainer: {
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 280,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  stepWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  stepIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepConnector: {
    width: 24,
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginHorizontal: 2,
  },
  completedConnector: {
    backgroundColor: '#007AFF',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  currentStepDot: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
    transform: [{ scale: 1 }],
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  completedStepDot: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  stepContainer: {
    flex: 1,
    padding: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.5,
    color: '#000',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(0, 0, 0, 0.5)",
    marginBottom: 32,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  goalsContainer: {
    gap: 12,
    paddingTop: 8,
  },
  goalButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGoalIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  goalTextContainer: {
    flex: 1,
    gap: 4,
  },
  selectedGoal: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  goalLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
    letterSpacing: -0.4,
  },
  goalDescription: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.6)",
    lineHeight: 18,
  },
  selectedText: {
    color: "#fff",
  },
  goalRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedGoalRadio: {
    borderColor: '#fff',
  },
  goalRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  restrictionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  restrictionWrapper: {
    width: (width - 96) / 3,
    aspectRatio: 1,
    position: 'relative',
  },
  restrictionButton: {
    width: (width - 96) / 3,
    aspectRatio: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  selectedRestriction: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    transform: [{ scale: 1.02 }],
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  restrictionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  restrictionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
  },
  buttonInnerContainer: {
    padding: 16,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftButtonGroup: {
    minWidth: 44,
  },
  rightButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  primaryButton: {
    height: 52,
    paddingHorizontal: 32,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    gap: 8,
    backgroundColor: '#007AFF',
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  skipButton: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  skipButtonText: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: -0.4,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  completeButton: {
    backgroundColor: '#34C759',
    ...Platform.select({
      ios: {
        shadowColor: '#34C759',
      },
    }),
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.4)',
    letterSpacing: -0.2,
  },
  currentStepLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContent: {
    flex: 1,
  },
  requiredIndicator: {
    color: '#FF3B30',
    marginLeft: 1,
    fontSize: 10,
  },
  optionsPanel: {
    position: 'absolute',
    left: '100%',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    gap: 4,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000',
  },
  selectedOptionText: {
    color: '#fff',
  },
  optionsBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#007AFF',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  activePaginationDot: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.2 }],
  },
  headerContainer: {
    marginBottom: 32,
  },
  inputSection: {
    marginTop: 8,
  },
  inputHint: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.4)',
    marginTop: 8,
    marginLeft: 16,
    letterSpacing: -0.2,
  },
  infoHint: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    letterSpacing: -0.5,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    padding: 20,
  },
  modalDescriptionContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#007AFF',
    letterSpacing: -0.24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionLast: {
    marginBottom: 0,
    paddingBottom: 20,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    letterSpacing: -0.4,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 16,
    alignItems: 'flex-start',
  },
  bulletDotContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  foodTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  foodTagText: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    letterSpacing: -0.24,
  },
}); 
