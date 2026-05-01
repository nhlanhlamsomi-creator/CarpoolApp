import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

/**
 * Wraps screens that require authentication.
 * 
 * Usage in AppNavigator:
 *   <Stack.Screen name="Home" component={() => (
 *     <ProtectedRoute role="passenger"><HomeScreen /></ProtectedRoute>
 *   )} />
 * 
 * Or at the navigator level — wrap the whole Tab navigator.
 * 
 * role: 'any' | 'passenger' | 'driver' | 'admin'
 */
export default function ProtectedRoute({ children, role = 'any', navigation }) {
  const { user, loading, isPassenger, isDriver, isAdmin } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Not logged in at all → kick to Login
  if (!user) {
    navigation?.replace('Login');
    return null;
  }

  // Role check
  if (role === 'passenger' && !isPassenger) {
    navigation?.replace('Login');
    return null;
  }
  if (role === 'driver' && !isDriver) {
    navigation?.replace('Login');
    return null;
  }
  if (role === 'admin' && !isAdmin) {
    navigation?.replace('Login');
    return null;
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
