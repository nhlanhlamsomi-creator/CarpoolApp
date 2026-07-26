import { Ionicons } from "@expo/vector-icons";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Option = {
  value: string;
  label: string;
  /** Optional second line — use it for context, not decoration. */
  description?: string;
};

type Props = {
  visible: boolean;
  title: string;
  subtitle?: string;
  options: Option[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

/**
 * A bottom sheet of mutually exclusive choices.
 * Used anywhere a free-text field would let people type something the app
 * can't act on — language, gender, vehicle preference.
 */
export default function OptionSheet({
  visible,
  title,
  subtitle,
  options,
  selected,
  onSelect,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Tapping the backdrop closes — expected on every platform */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      <View
        className="rounded-t-3xl bg-white"
        style={{ paddingBottom: insets.bottom + 12, maxHeight: "78%" }}
      >
        <View className="items-center pb-1 pt-3">
          <View className="h-1 w-11 rounded-full bg-[#DFE6E2]" />
        </View>

        <View className="flex-row items-start justify-between px-5 pb-3 pt-3">
          <View className="flex-1 pr-3">
            <Text className="text-[18px] font-JakartaExtraBold text-[#101814]">
              {title}
            </Text>
            {!!subtitle && (
              <Text className="mt-1 text-[12.5px] font-Jakarta text-[#68756F]">
                {subtitle}
              </Text>
            )}
          </View>

          <Pressable
            onPress={onClose}
            hitSlop={10}
            className="h-8 w-8 items-center justify-center rounded-full bg-[#EEF1F0] active:opacity-70"
          >
            <Ionicons name="close" size={17} color="#68756F" />
          </Pressable>
        </View>

        <ScrollView
          className="px-5"
          contentContainerStyle={{ paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {options.map((option) => {
            const active = option.value === selected;

            return (
              <Pressable
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className={`mb-2 flex-row items-center rounded-2xl border-[1.5px] px-4 py-3.5 ${
                  active
                    ? "border-[#0E5C3F] bg-[#E6F2EC]"
                    : "border-[#E2E9E5] bg-white"
                } active:opacity-80`}
              >
                <View className="flex-1">
                  <Text
                    className={`text-[14.5px] ${
                      active
                        ? "font-JakartaBold text-[#0E5C3F]"
                        : "font-JakartaSemiBold text-[#101814]"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {!!option.description && (
                    <Text className="mt-0.5 text-[12px] font-Jakarta text-[#68756F]">
                      {option.description}
                    </Text>
                  )}
                </View>

                <View
                  className={`ml-3 h-5 w-5 items-center justify-center rounded-full border-2 ${
                    active ? "border-[#0E5C3F] bg-[#0E5C3F]" : "border-[#DFE6E2]"
                  }`}
                >
                  {active && <Ionicons name="checkmark" size={11} color="#fff" />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Shared option sets ──────────────────────────────────────────────────────

/** All twelve official languages of South Africa. */
export const SA_LANGUAGES: Option[] = [
  { value: "English", label: "English" },
  { value: "isiZulu", label: "isiZulu" },
  { value: "isiXhosa", label: "isiXhosa" },
  { value: "Afrikaans", label: "Afrikaans" },
  { value: "Sepedi", label: "Sepedi", description: "Northern Sotho" },
  { value: "Setswana", label: "Setswana" },
  { value: "Sesotho", label: "Sesotho", description: "Southern Sotho" },
  { value: "Xitsonga", label: "Xitsonga" },
  { value: "siSwati", label: "siSwati" },
  { value: "Tshivenda", label: "Tshivenda" },
  { value: "isiNdebele", label: "isiNdebele" },
  { value: "SASL", label: "South African Sign Language" },
];

export const GENDER_OPTIONS: Option[] = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

export const VEHICLE_OPTIONS: Option[] = [
  {
    value: "Any",
    label: "Any vehicle",
    description: "Widest choice of drivers and the shortest wait",
  },
  {
    value: "Standard",
    label: "Standard",
    description: "Regular sedan or hatchback",
  },
  {
    value: "Comfort",
    label: "Comfort",
    description: "Newer car with more legroom",
  },
  {
    value: "Large",
    label: "Large",
    description: "Six seats or more, room for luggage",
  },
];