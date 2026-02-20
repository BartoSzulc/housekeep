import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { User, Household } from '../types/models';

const storage = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key));
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem: (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  activeHouseholdId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setActiveHousehold: (id: number) => void;
  setUser: (user: User) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  activeHouseholdId: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user: User, token: string) => {
    await storage.setItem('auth_token', token);
    await storage.setItem('auth_user', JSON.stringify(user));
    const householdId = user.households?.[0]?.id ?? null;
    if (householdId) {
      await storage.setItem('active_household_id', String(householdId));
    }
    set({ user, token, isAuthenticated: true, activeHouseholdId: householdId, isLoading: false });
  },

  setActiveHousehold: async (id: number) => {
    await storage.setItem('active_household_id', String(id));
    set({ activeHouseholdId: id });
  },

  setUser: (user: User) => {
    set({ user });
  },

  logout: async () => {
    await storage.deleteItem('auth_token');
    await storage.deleteItem('auth_user');
    await storage.deleteItem('active_household_id');
    set({ user: null, token: null, activeHouseholdId: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: async () => {
    try {
      const token = await storage.getItem('auth_token');
      const userStr = await storage.getItem('auth_user');
      const householdIdStr = await storage.getItem('active_household_id');

      if (token && userStr) {
        const user = JSON.parse(userStr) as User;
        const householdId = householdIdStr ? parseInt(householdIdStr, 10) : null;
        set({ user, token, isAuthenticated: true, activeHouseholdId: householdId, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
