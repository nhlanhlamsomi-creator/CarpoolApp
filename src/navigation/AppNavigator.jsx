import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Auth
import SplashScreen         from '../screens/auth/SplashScreen';
import WelcomeScreen        from '../screens/auth/WelcomeScreen';
import GetStartedScreen     from '../screens/auth/GetStartedScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';
import LoginScreen          from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Passenger
import HomeSearchScreen       from '../screens/passenger/HomeSearchScreen';
import TripResultsScreen      from '../screens/passenger/TripResultsScreen';
import ConfirmBookingScreen   from '../screens/passenger/ConfirmBookingScreen';
import MyTripsScreen          from '../screens/passenger/MyTripsScreen';
import PassengerProfileScreen from '../screens/passenger/PassengerProfileScreen';
import EditProfileScreen       from '../screens/passenger/EditProfileScreen';
import IDVerificationScreen    from '../screens/passenger/IDVerificationScreen';
import SelfieVerificationScreen from '../screens/passenger/SelfieVerificationScreen';
import PaymentMethodsScreen    from '../screens/passenger/PaymentMethodsScreen';

// Driver
import DriverHomeScreen    from '../screens/driver/DriverHomeScreen';
import CreateTripScreen    from '../screens/driver/CreateTripScreen';
import EarningsScreen      from '../screens/driver/EarningsScreen';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';

// Shared
import ActiveRideScreen from '../screens/shared/ActiveRideScreen';
import SOSScreen        from '../screens/shared/SOSScreen';
import RateDriverScreen from '../screens/shared/RateDriverScreen';
import TripChatScreen   from '../screens/shared/TripChatScreen';

import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── SVG Tab Icons ────────────────────────────────────────────────────────────

const IconSearch = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2" />
    <Path d="M16.5 16.5L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const IconCalendar = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M3 9h18" stroke={color} strokeWidth="2" />
    <Path d="M8 2v4M16 2v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M8 13h2M14 13h2M8 17h2M14 17h2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const IconUser = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" />
    <Path d="M4 21v-1a8 8 0 0 1 16 0v1" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const IconHome = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3 12L12 3l9 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 21V12h6v9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 10v11h14V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconPlus = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const IconEarnings = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M12.5 7.5v.92C14.1 8.7 15.5 9.85 15.5 11.5c0 .55-.45 1-1 1s-1-.45-1-1c0-.35-.45-.75-1-.75s-1 .4-1 .75c0 .3.15.48.52.63l1.98.66C14.64 13.2 15.5 14 15.5 15.5c0 1.5-1.3 2.7-3 2.93v.92c0 .55-.45 1-1 1s-1-.45-1-1v-.92C8.9 18.2 7.5 17 7.5 15.5c0-.55.45-1 1-1s1 .45 1 1c0 .35.45.75 1 .75s1-.4 1-.75c0-.3-.15-.48-.52-.63l-1.98-.66C7.36 13.8 6.5 13 6.5 11.5c0-1.5 1.3-2.7 3-2.92V7.5c0-.55.45-1 1-1s1 .45 1 1z" fill={color} />
  </Svg>
);

// ─── Tab item ─────────────────────────────────────────────────────────────────

function TabItem({ IconComp, label, focused }) {
  const color = focused ? colors.primary : '#B0B8C1';
  return (
    <View style={tabStyles.item}>
      {/* Active indicator dot */}
      {focused && <View style={tabStyles.activeDot} />}
      <IconComp color={color} />
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Tab navigators ───────────────────────────────────────────────────────────

function PassengerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.bar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeSearch"
        component={HomeSearchScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem IconComp={IconSearch} label="Search" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MyTrips"
        component={MyTripsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem IconComp={IconCalendar} label="Trips" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PassengerProfile"
        component={PassengerProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem IconComp={IconUser} label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function DriverTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.bar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem IconComp={IconHome} label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateTrip"
        component={CreateTripScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem IconComp={IconPlus} label="Create" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem IconComp={IconEarnings} label="Earn" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="DriverProfile"
        component={DriverProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem IconComp={IconUser} label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {/* ── Auth flow ── */}
        <Stack.Screen name="Splash"     component={SplashScreen} />
        <Stack.Screen name="Welcome"    component={WelcomeScreen}     options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen}  options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Register"   component={RegisterScreen}    options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Login"      component={LoginScreen}       options={{ animation: 'slide_from_right' }} />

        {/*
          ForgotPassword: presented as a modal (slides up from bottom).
          This means it sits ON TOP of Login in the stack.
          pressing back always dismisses back to Login correctly,
          regardless of where in the auth flow you came from.
        */}
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            animation: 'slide_from_bottom',
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />

        {/* ── Profile sub-screens ── */}
        <Stack.Screen name="EditProfile"       component={EditProfileScreen}       options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="IDVerification"    component={IDVerificationScreen}    options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="SelfieVerification" component={SelfieVerificationScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="PaymentMethods"    component={PaymentMethodsScreen}    options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ChangePassword"    component={ForgotPasswordScreen}    options={{ animation: 'slide_from_right' }} />

        {/* ── Passenger app ── */}
        <Stack.Screen name="PassengerTabs"  component={PassengerTabs}       options={{ animation: 'fade' }} />
        <Stack.Screen name="TripResults"    component={TripResultsScreen}    options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ConfirmBooking" component={ConfirmBookingScreen} options={{ animation: 'slide_from_bottom' }} />

        {/* ── Driver app ── */}
        <Stack.Screen name="DriverTabs" component={DriverTabs} options={{ animation: 'fade' }} />

        {/* ── Shared screens ── */}
        <Stack.Screen name="ActiveRide" component={ActiveRideScreen} options={{ animation: 'slide_from_right', gestureEnabled: false }} />
        <Stack.Screen name="TripChat"   component={TripChatScreen}   options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="RateDriver" component={RateDriverScreen}  options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="SOS"        component={SOSScreen}         options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ─── Tab styles ───────────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    height: 72,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 10,
    color: '#B0B8C1',
    fontWeight: '500',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});