import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Auth
import SplashScreen        from '../screens/auth/SplashScreen';
import WelcomeScreen       from '../screens/auth/WelcomeScreen';
import GetStartedScreen    from '../screens/auth/GetStartedScreen';
import RegisterScreen      from '../screens/auth/RegisterScreen';
import LoginScreen         from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Passenger
import HomeSearchScreen      from '../screens/passenger/HomeSearchScreen';
import TripResultsScreen     from '../screens/passenger/TripResultsScreen';
import ConfirmBookingScreen  from '../screens/passenger/ConfirmBookingScreen';
import MyTripsScreen         from '../screens/passenger/MyTripsScreen';
import PassengerProfileScreen from '../screens/passenger/PassengerProfileScreen';

// Driver
import DriverHomeScreen    from '../screens/driver/DriverHomeScreen';
import CreateTripScreen    from '../screens/driver/CreateTripScreen';
import EarningsScreen      from '../screens/driver/EarningsScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';

// Shared
import ActiveRideScreen  from '../screens/shared/ActiveRideScreen';
import SOSScreen         from '../screens/shared/SOSScreen';
import RateDriverScreen  from '../screens/shared/RateDriverScreen';
import TripChatScreen    from '../screens/shared/TripChatScreen';

import { colors, typography } from '../theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={tabStyles.icon}>
      <Text style={tabStyles.emoji}>{emoji}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

function PassengerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: tabStyles.bar, tabBarShowLabel: false }}>
      <Tab.Screen name="HomeSearch" component={HomeSearchScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} /> }} />
      <Tab.Screen name="MyTrips" component={MyTripsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗓" label="Trips" focused={focused} /> }} />
      <Tab.Screen name="PassengerProfile" component={PassengerProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: tabStyles.bar, tabBarShowLabel: false }}>
      <Tab.Screen name="DriverHome" component={DriverHomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tab.Screen name="CreateTrip" component={CreateTripScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="➕" label="Create" focused={focused} /> }} />
      <Tab.Screen name="Earnings" component={EarningsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Earn" focused={focused} /> }} />
      <Tab.Screen name="DriverProfile" component={DriverProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false, animation: 'fade' }}>

        {/* Auth flow */}
        <Stack.Screen name="Splash"          component={SplashScreen} />
        <Stack.Screen name="Welcome"         component={WelcomeScreen}        options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="GetStarted"      component={GetStartedScreen}     options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Register"        component={RegisterScreen}        options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Login"           component={LoginScreen}           options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ForgotPassword"  component={ForgotPasswordScreen}  options={{ animation: 'slide_from_right' }} />

        {/* Passenger app */}
        <Stack.Screen name="PassengerTabs"   component={PassengerTabs}         options={{ animation: 'fade' }} />
        <Stack.Screen name="TripResults"     component={TripResultsScreen}     options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ConfirmBooking"  component={ConfirmBookingScreen}  options={{ animation: 'slide_from_bottom' }} />

        {/* Driver app */}
        <Stack.Screen name="DriverTabs"      component={DriverTabs}            options={{ animation: 'fade' }} />

        {/* Shared screens */}
        <Stack.Screen name="ActiveRide"      component={ActiveRideScreen}      options={{ animation: 'slide_from_right', gestureEnabled: false }} />
        <Stack.Screen name="TripChat"        component={TripChatScreen}        options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="RateDriver"      component={RateDriverScreen}      options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="SOS"             component={SOSScreen}             options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  icon:       { alignItems: 'center', justifyContent: 'center', gap: 2 },
  emoji:      { fontSize: 22 },
  label:      { fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  labelActive:{ color: colors.primary },
});
