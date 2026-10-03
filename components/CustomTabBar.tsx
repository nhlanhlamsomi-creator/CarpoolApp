import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import {
	Animated,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

type NavItem =
	| {
			label: string;
			iconType: "ionicons";
			iconName: keyof typeof Ionicons.glyphMap;
			badge?: number;
		}
	| {
			label: string;
			iconType: "fontawesome";
			iconName: keyof typeof FontAwesome5.glyphMap;
			badge?: number;
		}
	| {
			label: string;
			iconType: "feather";
			iconName: keyof typeof Feather.glyphMap;
			badge?: number;
		};

const NAV_ITEMS: Record<string, NavItem> = {
	home: { label: "Home", iconType: "ionicons", iconName: "home-outline" },
	rides: { label: "Rides", iconType: "fontawesome", iconName: "car" },
	chat: {
		label: "Messages",
		iconType: "ionicons",
		iconName: "chatbubble-ellipses-outline",
		badge: 1,
	},
	profile: { label: "Profile", iconType: "feather", iconName: "user" },
};

function TabIcon({ item, focused }: { item: NavItem; focused: boolean }) {
	const color = focused ? "#111111" : "#B7B8BF";

	switch (item.iconType) {
		case "fontawesome":
			return <FontAwesome5 name={item.iconName} size={18} color={color} />;
		case "feather":
			return <Feather name={item.iconName} size={19} color={color} />;
		default:
			return <Ionicons name={item.iconName} size={20} color={color} />;
	}
}

function TabButton({
	item,
	route,
	focused,
	label,
	onPress,
	onLongPress,
}: {
	item: NavItem;
	route: BottomTabBarProps["state"]["routes"][number];
	focused: boolean;
	label: string;
	onPress: () => void;
	onLongPress: () => void;
}) {
	const [width] = useState(() => new Animated.Value(44));
	const activeWidth = 48 + item.label.length * 6 + 16;

	useEffect(() => {
		Animated.spring(width, {
			toValue: focused ? activeWidth : 44,
			stiffness: 360,
			damping: 30,
			mass: 0.8,
			useNativeDriver: false,
		}).start();
	}, [activeWidth, focused, width]);

	return (
		<Pressable
			onPress={onPress}
			onLongPress={onLongPress}
			accessibilityRole="tab"
			accessibilityLabel={`${label} tab`}
			accessibilityState={{ selected: focused }}
			testID={route.key}
			style={({ pressed }) => [pressed && styles.pressed]}
		>
			<Animated.View
				style={[
					styles.tabButton,
					focused ? styles.activeTab : styles.inactiveTab,
					{ width },
				]}
			>
				<TabIcon item={item} focused={focused} />
				{focused && <Text style={styles.activeLabel}>{label}</Text>}
				{item.badge !== undefined && !focused && (
					<View style={styles.badge}>
						<Text style={styles.badgeText}>{item.badge}</Text>
					</View>
				)}
			</Animated.View>
		</Pressable>
	);
}

export default function CustomTabBar({
	state,
	descriptors,
	navigation,
	insets,
}: BottomTabBarProps) {
	return (
		<View
			pointerEvents="box-none"
			style={[styles.positioner, { bottom: Math.max(insets.bottom, 12) + 3 }]}
		>
			<View style={styles.bar} accessibilityRole="tablist">
				{state.routes.map((route, index) => {
					const item = NAV_ITEMS[route.name];
					if (!item) return null;

					const focused = state.index === index;
					const label = descriptors[route.key].options.title ?? item.label;

					return (
						<TabButton
							key={route.key}
							item={item}
							route={route}
							focused={focused}
							label={label}
							onPress={() => {
								const event = navigation.emit({
									type: "tabPress",
									target: route.key,
									canPreventDefault: true,
								});

								if (!focused && !event.defaultPrevented) {
									navigation.navigate(route.name, route.params);
								}
							}}
							onLongPress={() =>
								navigation.emit({ type: "tabLongPress", target: route.key })
							}
						/>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	positioner: {
		position: "absolute",
		left: 0,
		right: 0,
		alignItems: "center",
	},
	bar: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		padding: 6,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.1)",
		backgroundColor: "rgba(22,23,27,0.94)",
		shadowColor: "#000000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.36,
		shadowRadius: 18,
		elevation: 12,
	},
	tabButton: {
		height: 44,
		position: "relative",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		overflow: "hidden",
		borderRadius: 999,
	},
	activeTab: {
		backgroundColor: "#FFFFFF",
	},
	inactiveTab: {
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.06)",
		backgroundColor: "rgba(255,255,255,0.07)",
	},
	activeLabel: {
		color: "#111111",
		fontFamily: "Jakarta-Bold",
		fontSize: 13,
	},
	badge: {
		position: "absolute",
		top: 7,
		right: 7,
		minWidth: 14,
		height: 14,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 3,
		borderRadius: 7,
		borderWidth: 1,
		borderColor: "#202126",
		backgroundColor: "#3B82F6",
	},
	badgeText: {
		color: "#FFFFFF",
		fontFamily: "Jakarta-Bold",
		fontSize: 8,
		lineHeight: 10,
	},
	pressed: {
		opacity: 0.8,
	},
});
