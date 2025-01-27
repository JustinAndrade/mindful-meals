import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import AuthInput from "../components/AuthInput";
import LoadingSpinner from "../components/LoadingSpinner";

interface ValidationError {
  field: string;
  message: string;
}

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUp, loading } = useAuth();
  const router = useRouter();

  const validateForm = useCallback((): ValidationError | null => {
    // Required fields
    if (!email || !password || !confirmPassword) {
      return {
        field: "general",
        message: "Please fill in all fields",
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        field: "email",
        message: "Please enter a valid email address",
      };
    }

    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return {
        field: "password",
        message:
          "Password must be at least 8 characters long and contain at least one letter and one number",
      };
    }

    // Password match
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
      Alert.alert(
        "Success",
        "Account created successfully! Please verify your email.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login" as never),
          },
        ]
      );
    } catch (err) {
      Alert.alert("Error", (err as Error).message);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.form}>
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
        />

        <AuthInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoComplete="password-new"
          testID="password-input"
        />

        <Text style={styles.passwordHint}>
          Password must be at least 8 characters long and contain at least one
          letter and one number
        </Text>

        <AuthInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          autoComplete="password-new"
          testID="confirm-password-input"
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
            Already have an account? <Text style={styles.link}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  form: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
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
    marginTop: 16,
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
