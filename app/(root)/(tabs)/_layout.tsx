import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View } from "react-native";

import { icons } from "@/constants";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    className={`h-12 w-12 items-center justify-center rounded-2xl ${
      focused ? "bg-[#1FB574]" : "bg-transparent"
    }`}
  >
    <Image
      source={source}
      tintColor={focused ? "#FFFFFF" : "rgba(255,255,255,0.45)"}
      resizeMode="contain"
      className="h-6 w-6"
    />
  </View>
);

export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#06231A",
          borderRadius: 26,
          paddingBottom: 10,
          paddingTop: 10,
          height: 72,
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 20,
          borderTopWidth: 0,
          borderWidth: 0,
          shadowColor: "#06231A",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.28,
          shadowRadius: 22,
          elevation: 14,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}