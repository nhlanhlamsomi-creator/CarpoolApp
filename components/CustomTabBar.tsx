import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { icons } from "@/constants";

type NavItem = {
	label: string;
	iconSource: any;
	badge?: number;
};

const NAV_ITEMS: Record<string, NavItem> = {
	home: { label: "Home", iconSource: icons.home },
	rides: { label: "Rides", iconSource: icons.car },
	chat: {
		label: "Messages",
		iconSource: icons.chat,
		badge: 1,
	},
	profile: { label: "Profile", iconSource: icons.person },
};

function TabIcon({ item, focused }: { item: NavItem; focused: boolean }) {
	const iconTint = focused ? "#FFFFFF" : "#C9B8DB";

	return (
		<Image
			source={item.iconSource}
			resizeMode="contain"
			style={{
				width: 20,
				height: 20,
				tintColor: iconTint,
			}}
		/>
	);
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
		borderColor: "rgba(255,255,255,0.16)",
		backgroundColor: "#1D1135",
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
		backgroundColor: "#5A189A",
	},
	inactiveTab: {
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.08)",
		backgroundColor: "rgba(255,255,255,0.06)",
	},
	activeLabel: {
		color: "#FFFFFF",
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
		borderColor: "#1D1135",
		backgroundColor: "#9D4EDD",
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
