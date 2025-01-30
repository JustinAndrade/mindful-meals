import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import LoadingSpinner from "../components/LoadingSpinner";

type DietaryGoalType = "weight_loss" | "bulking" | "maintenance";

interface DietaryRestriction {
  id: string;
  label: string;
}

const DIETARY_RESTRICTIONS: DietaryRestriction[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Gluten Free" },
  { id: "dairy_free", label: "Dairy Free" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
];

export default function ProfileSetupScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [dietaryGoal, setDietaryGoal] = useState<DietaryGoalType>("maintenance");
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [favoriteIngredients, setFavoriteIngredients] = useState<string>("");

  const handleSaveProfile = async () => {
    if (!displayName) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://10.0.0.223:6000/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.uid,
          email: user?.email,
          displayName,
          dietaryGoals: {
            type: dietaryGoal,
          },
          preferences: {
            dietaryRestrictions: selectedRestrictions,
            favoriteIngredients: favoriteIngredients
              .split(",")
              .map((ingredient) => ingredient.trim())
              .filter((ingredient) => ingredient.length > 0),
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Tell us about your preferences</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Name</Text>
          <AuthInput
            placeholder="Enter your name"
            value={displayName}
            onChangeText={setDisplayName}
            autoComplete="name"
            testID="name-input"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Goal</Text>
          <View style={styles.goalsContainer}>
            {["weight_loss", "maintenance", "bulking"].map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalButton,
                  dietaryGoal === goal && styles.goalButtonActive,
                ]}
                onPress={() => setDietaryGoal(goal as DietaryGoalType)}
              >
                <Text
                  style={[
                    styles.goalButtonText,
                    dietaryGoal === goal && styles.goalButtonTextActive,
                  ]}
                >
                  {goal.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          <View style={styles.restrictionsContainer}>
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <TouchableOpacity
                key={restriction.id}
                style={[
                  styles.restrictionButton,
                  selectedRestrictions.includes(restriction.id) &&
                    styles.restrictionButtonActive,
                ]}
                onPress={() => toggleRestriction(restriction.id)}
              >
                <Text
                  style={[
                    styles.restrictionButtonText,
                    selectedRestrictions.includes(restriction.id) &&
                      styles.restrictionButtonTextActive,
                  ]}
                >
                  {restriction.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Ingredients</Text>
          <Text style={styles.hint}>
            Enter ingredients separated by commas (e.g., chicken, rice, avocado)
          </Text>
          <AuthInput
            placeholder="Enter your favorite ingredients"
            value={favoriteIngredients}
            onChangeText={setFavoriteIngredients}
            multiline
            numberOfLines={3}
            testID="ingredients-input"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveProfile}
          testID="save-profile-button"
        >
          <Text style={styles.buttonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1a1a1a",
  },
  hint: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  goalsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  goalButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  goalButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  goalButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  goalButtonTextActive: {
    color: "#fff",
  },
  restrictionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  restrictionButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  restrictionButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  restrictionButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  restrictionButtonTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
}); 
