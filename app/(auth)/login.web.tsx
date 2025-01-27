import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import { useResponsive } from "../hooks/useResponsive";
import AuthInput from "../components/AuthInput";
import LoadingSpinner from "../components/LoadingSpinner";

export default function WebLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await signIn(email, password);
      router.replace("/(tabs)" as never);
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

        {/* Right side - Login Form */}
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

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
              isPassword
              autoComplete="password"
              testID="password-input"
              style={styles.webInput}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.replace("/(auth)/reset-password" as never)}
              testID="forgot-password-link"
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              testID="login-button"
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.replace("/(auth)/signup" as never)}
              testID="signup-link"
            >
              <Text style={styles.linkText}>
                Don't have an account? <Text style={styles.link}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#007AFF",
    fontSize: 14,
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
