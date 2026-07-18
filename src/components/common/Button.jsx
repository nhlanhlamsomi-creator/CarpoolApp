import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

/**
 * Button variants:
 *  primary  — solid green (default)
 *  secondary — outlined green
 *  ghost    — text-only green
 *  danger   — red for destructive actions
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },

  // Sizes
  size_sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  size_md: { paddingHorizontal: spacing.lg, paddingVertical: 14 },
  size_lg: { paddingHorizontal: spacing.xl, paddingVertical: 18 },
  size_full: { paddingHorizontal: spacing.lg, paddingVertical: 16, width: '100%' },

  // Text
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  text_primary: { color: colors.white },
  text_secondary: { color: colors.primary },
  text_ghost: { color: colors.primary },
  text_danger: { color: colors.white },

  textSize_sm: { fontSize: typography.fontSize.sm },
  textSize_md: { fontSize: typography.fontSize.base },
  textSize_lg: { fontSize: typography.fontSize.md },
  textSize_full: { fontSize: typography.fontSize.md },

  // States
  disabled: { opacity: 0.45 },
});
