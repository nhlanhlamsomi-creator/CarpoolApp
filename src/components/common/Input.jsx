import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon = null,
  rightIcon = null,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.container,
          { borderColor },
          isFocused && styles.focused,
          error && styles.errorContainer,
          !editable && styles.disabled,
        ]}
      >
        {leftIcon ? (
          <View style={styles.leftIcon}>{leftIcon}</View>
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeft,
            (rightIcon || secureTextEntry) && styles.inputWithRight,
            multiline && styles.multiline,
            inputStyle,
          ]}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  focused: {
    backgroundColor: colors.white,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  errorContainer: {
    backgroundColor: '#FFF8F8',
  },
  disabled: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    paddingVertical: 14,
  },
  inputWithLeft: {
    marginLeft: spacing.sm,
  },
  inputWithRight: {
    marginRight: spacing.sm,
  },
  multiline: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  leftIcon: {
    marginRight: 2,
  },
  rightIcon: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});
