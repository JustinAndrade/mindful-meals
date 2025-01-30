import 'react-native-get-random-values';
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import useAuth from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import { View, Platform } from "react-native";
import mongodb from "./config/mongodb";

export default function RootLayout() {
  const { user, loading, initialized } = useAuth();

  // Initialize MongoDB connection
  useEffect(() => {
    // Only connect to MongoDB in web environment
    // Mobile apps will connect through the API server
    if (Platform.OS === 'web') {
      mongodb.connectDB().catch(console.error);
    }
  }, []);

  // Show loading spinner during initial auth check
  if (!initialized || loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}
