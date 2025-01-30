import { Platform } from "react-native";

// For iOS simulator, we need to use localhost with the port
// For iOS physical device, you would need to use your computer's local IP address
// For web, we use localhost
const getBaseUrl = () => {
  if (Platform.OS === "ios") {
    return "http://localhost:6000";
  }
  if (Platform.OS === "android") {
    return "http://10.0.2.2:6000"; // Android Studio emulator
  }
  return "http://localhost:6000"; // web
};

export const API_BASE_URL = getBaseUrl();

// Helper function to build API URLs
export const buildApiUrl = (path: string) => {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const api = {
  BASE_URL: API_BASE_URL,
  buildUrl: buildApiUrl,
};

export default api;
