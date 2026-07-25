import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type ProfileSectionCardProps = {
  title: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  accent?: string;
};

const ProfileSectionCard = ({
  title,
  value,
  icon = "chevron-forward",
  onPress,
  accent = "text-neutral-900",
}: ProfileSectionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm shadow-neutral-200"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
          <Ionicons name={icon} size={18} color="#111827" />
        </View>
        <View>
          <Text className={`text-sm font-JakartaSemiBold ${accent}`}>{title}</Text>
          {value ? (
            <Text className="mt-1 text-xs text-neutral-500">{value}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#6B7280" />
    </Pressable>
  );
};

export default ProfileSectionCard;
