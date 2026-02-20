import { Platform } from 'react-native';

export const API_URL = __DEV__
  ? Platform.select({
      android: 'http://10.0.2.2:8000',   // Android emulator -> localhost
      ios: 'http://localhost:8000',        // iOS simulator
      default: 'http://192.168.0.223:8000', // Expo Go on phone (LAN IP)
    })!
  : 'https://apihouse.tojest.dev'; // Production URL on Mikrus
