import { Text, View } from "react-native";

type StatCardProps = {
  icon: string;
  label: string;
  value: string;
};

const StatCard = ({ icon, label, value }: StatCardProps) => {
  return (
    <View className="flex-1 rounded-2xl border border-neutral-200 bg-white px-3 py-4 shadow-sm shadow-neutral-200">
      <Text className="text-2xl">{icon}</Text>
      <Text className="mt-2 text-sm text-neutral-500">{label}</Text>
      <Text className="mt-1 text-lg font-JakartaBold text-neutral-900">
        {value}
      </Text>
    </View>
  );
};

export default StatCard;
