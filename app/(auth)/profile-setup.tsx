import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTheme } from '@react-navigation/native';
import IngredientSelector from '../components/IngredientSelector';
import { API_URL } from '../config/api';

type DietaryGoalType = "weight_loss" | "bulking" | "maintenance";

interface Ingredient {
  _id: string;
  name: string;
  category: string[];
  dietaryCategories: string[];
}

const dietaryGoals = [
  { id: 'weight_loss', label: 'Weight Loss', description: 'Focus on calorie deficit and lean proteins' },
  { id: 'maintenance', label: 'Maintenance', description: 'Balance your nutrition and maintain weight' },
  { id: 'bulking', label: 'Muscle Gain', description: 'Increase protein and healthy calories' },
];

const dietaryRestrictions = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten_free', label: 'Gluten Free', icon: '🌾' },
  { id: 'dairy_free', label: 'Dairy Free', icon: '🥛' },
  { id: 'keto', label: 'Keto', icon: '🥑' },
  { id: 'paleo', label: 'Paleo', icon: '🍖' },
];

type Step = 'name' | 'goal' | 'restrictions' | 'favorites' | 'avoid';

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

  const steps: Step[] = ['name', 'goal', 'restrictions', 'favorites', 'avoid'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStep === 'name' && !displayName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    } else {
      handleSaveProfile();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
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

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View 
          key={step}
          style={[
            styles.stepDot,
            index === currentStepIndex && styles.currentStepDot,
            index < currentStepIndex && styles.completedStepDot,
          ]}
        />
      ))}
    </View>
  );

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>What's your name?</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        We'll use this to personalize your experience
      </Text>
      <AuthInput
        placeholder="Enter your name"
        value={displayName}
        onChangeText={setDisplayName}
        autoComplete="name"
        testID="name-input"
        autoFocus
      />
    </View>
  );

  const renderGoalStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>What's your goal?</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        This helps us recommend the right meals for you
      </Text>
      <View style={styles.goalsContainer}>
        {dietaryGoals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.goalButton,
              selectedGoal === goal.id && styles.selectedGoal,
              { borderColor: colors.border },
            ]}
            onPress={() => setSelectedGoal(goal.id as DietaryGoalType)}
          >
            <Text style={[styles.goalLabel, selectedGoal === goal.id && styles.selectedText]}>
              {goal.label}
            </Text>
            <Text style={[styles.goalDescription, selectedGoal === goal.id && styles.selectedText]}>
              {goal.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderRestrictionsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>
        Any dietary restrictions?
      </Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Select all that apply
      </Text>
      <View style={styles.restrictionsGrid}>
        {dietaryRestrictions.map((restriction) => (
          <TouchableOpacity
            key={restriction.id}
            style={[
              styles.restrictionButton,
              selectedRestrictions.includes(restriction.id) && styles.selectedRestriction,
            ]}
            onPress={() => toggleRestriction(restriction.id)}
          >
            <Text style={styles.restrictionIcon}>{restriction.icon}</Text>
            <Text style={[
              styles.restrictionText,
              selectedRestrictions.includes(restriction.id) && styles.selectedText,
            ]}>
              {restriction.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFavoritesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: colors.text }]}>
        What are your favorite ingredients?
      </Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        We'll include these in your meal suggestions
      </Text>
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
      <Text style={[styles.title, { color: colors.text }]}>
        Any ingredients to avoid?
      </Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        We'll exclude these from your meal suggestions
      </Text>
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

  return (
    <SafeAreaView style={styles.container}>
      {renderStepIndicator()}
      {renderCurrentStep()}
      <View style={styles.buttonContainer}>
        {currentStepIndex > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            currentStepIndex === 0 && styles.fullWidthButton,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  currentStepDot: {
    backgroundColor: '#007AFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completedStepDot: {
    backgroundColor: '#4CD964',
  },
  stepContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  goalsContainer: {
    gap: 16,
  },
  goalButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedGoal: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  goalDescription: {
    fontSize: 14,
    color: "#666",
  },
  selectedText: {
    color: "#fff",
  },
  restrictionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  restrictionButton: {
    width: (width - 52) / 2,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedRestriction: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  restrictionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  restrictionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
  },
  nextButton: {
    backgroundColor: '#007AFF',
  },
  fullWidthButton: {
    flex: 1,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 
