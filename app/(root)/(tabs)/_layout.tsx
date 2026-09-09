import { icons } from "@/constants";
import { Tabs } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

const TabIcon = ({
  focused,
  label,
  source,
}: {
  focused: boolean;
  label: string;
  source: any;
}) => (
  <View className="w-[68px] items-center justify-center gap-2 pt-1">
    <View
      className={`h-[52px] w-[52px] items-center justify-center rounded-[18px] ${
        focused ? "bg-[#F7A13B]" : "bg-[#000000]"
      }`}
    >
      <Image
        source={source}
        resizeMode="contain"
        style={{
          width: 22,
          height: 22,
          tintColor: "#FFFFFF",
        }}
      />
    </View>
    <Text
      className={`text-[10px] ${
        focused
          ? "font-JakartaBold text-[#1B2C4D]"
          : "font-JakartaMedium text-[#000000]"
      }`}
    >
      {label}
    </Text>
  </View>
);

export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderRadius: 28,
          height: 86,
          paddingTop: 8,
          paddingBottom: 6,
          paddingHorizontal: 12,
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 8,
          borderTopWidth: 0,
          borderWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
          overflow: "hidden",
          justifyContent: "space-between",
        },
        tabBarItemStyle: {
          width: "25%",
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarButton: (props: any) => (
          <Pressable
            {...props}
            style={({ pressed }) => ({
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
              backgroundColor: "transparent",
            })}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} label="Trips" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.dollar} label="Earnings" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} label="Messages" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}