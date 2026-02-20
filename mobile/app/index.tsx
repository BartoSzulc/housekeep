import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';

export default function Index() {
  const { isAuthenticated, isLoading, activeHouseholdId } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!activeHouseholdId) {
    return <Redirect href="/(app)/household/create" />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}
