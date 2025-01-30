import { Platform } from "react-native";
import Constants from 'expo-constants';

// Get the local IP address for development
const LOCAL_IP = '10.0.0.223'; // Replace with your actual local IP address

// For development, use appropriate URLs for different environments
const DEV_API_URL = Platform.select({
  // For iOS:
  ios: Constants.platform?.ios?.isSimulator 
    ? 'http://localhost:6000/api'        // iOS Simulator
    : `http://${LOCAL_IP}:6000/api`,     // iOS Device
  
  // For Android:
  android: Platform.isTV
    ? `http://${LOCAL_IP}:6000/api`      // Android Device
    : 'http://10.0.2.2:6000/api',        // Android Emulator
  
  // Default (Web):
  default: 'http://localhost:6000/api',
});

const PROD_API_URL = 'https://api.mindfulmeals.com/api'; // Replace with your production API URL

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Helper function to build API URLs
export const buildApiUrl = (path: string) => {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const api = {
  BASE_URL: API_URL,
  buildUrl: buildApiUrl,
};

export default api;
