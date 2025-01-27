import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import useResponsive from "../hooks/useResponsive";
import AuthInput from "../components/AuthInput";
import LoadingSpinner from "../components/LoadingSpinner";

interface ValidationError {
  field: string;
  message: string;
}

export default function WebSignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp, loading } = useAuth();
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  const validateForm = useCallback((): ValidationError | null => {
    if (!email || !password || !confirmPassword) {
      return { field: "general", message: "Please fill in all fields" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { field: "email", message: "Please enter a valid email address" };
    }

    if (password.length < 8) {
      return {
        field: "password",
        message: "Password must be at least 8 characters long",
      };
    }

    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return {
        field: "password",
        message: "Password must contain at least one letter and one number",
      };
    }

    if (password !== confirmPassword) {
      return {
        field: "confirmPassword",
        message: "Passwords do not match",
      };
    }

    return null;
  }, [email, password, confirmPassword]);

  const handleSignup = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert("Error", validationError.message);
      return;
    }

    try {
      await signUp(email, password);
      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/(auth)/login" as never),
        },
      ]);
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.contentContainer, isMobile && styles.mobileContainer]}
      >
        {/* Left side - Branding */}
        {!isMobile && (
          <View
            style={[styles.brandSection, isTablet && styles.tabletBrandSection]}
          >
            <Text
              style={[styles.brandTitle, isTablet && styles.tabletBrandTitle]}
            >
              Mindful Meals
            </Text>
            <Text
              style={[
                styles.brandSubtitle,
                isTablet && styles.tabletBrandSubtitle,
              ]}
            >
              Your personal meal planning assistant
            </Text>
          </View>
        )}

        {/* Right side - Signup Form */}
        <View
          style={[styles.formSection, isMobile && styles.mobileFormSection]}
        >
          <View
            style={[
              styles.formContainer,
              isMobile && styles.mobileFormContainer,
            ]}
          >
            {isMobile && (
              <Text style={[styles.brandTitle, styles.mobileBrandTitle]}>
                Mindful Meals
              </Text>
            )}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <AuthInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              testID="email-input"
              autoCapitalize="none"
              style={styles.webInput}
            />

            <AuthInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
              testID="password-input"
              style={styles.webInput}
            />

            <Text style={styles.passwordHint}>
              Password must be at least 8 characters long and contain at least
              one letter and one number
            </Text>

            <AuthInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password-new"
              testID="confirm-password-input"
              style={styles.webInput}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              testID="signup-button"
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.replace("/(auth)/login" as never)}
              testID="login-link"
            >
              <Text style={styles.linkText}>
                Already have an account?{" "}
                <Text style={styles.link}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  mobileContainer: {
    flexDirection: "column",
  },
  brandSection: {
    flex: 1,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  tabletBrandSection: {
    flex: 0.7,
    padding: 30,
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  mobileBrandTitle: {
    color: "#007AFF",
    fontSize: 36,
    marginBottom: 24,
    textAlign: "center",
  },
  tabletBrandTitle: {
    fontSize: 36,
  },
  brandSubtitle: {
    fontSize: 24,
    color: "#fff",
    opacity: 0.9,
    textAlign: "center",
  },
  tabletBrandSubtitle: {
    fontSize: 20,
  },
  formSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: "#fff",
  },
  mobileFormSection: {
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  mobileFormContainer: {
    maxWidth: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  webInput: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    width: "100%",
  },
  passwordHint: {
    fontSize: 12,
    color: "#666",
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
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
  linkButton: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});
