import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { tokens } from '../design-system/tokens';

type Variant = 'primary' | 'subtle' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  leftSlot?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  leftSlot,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizes[size],
        variants[variant],
        pressed && { opacity: 0.85 },
        isDisabled && { opacity: 0.55 },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {loading ? (
          <ActivityIndicator color={variant === 'ghost' ? tokens.colors.fg1 : tokens.colors.actionFg} />
        ) : (
          leftSlot
        )}
        <Text style={[textStyles[variant], sizeText[size]]}>{children}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const sizes: Record<Size, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: 12 },
  md: { paddingVertical: 12, paddingHorizontal: 16 },
  lg: { paddingVertical: 16, paddingHorizontal: 20 },
};

const sizeText: Record<Size, { fontSize: number; fontWeight: '600' }> = {
  sm: { fontSize: 13, fontWeight: '600' },
  md: { fontSize: 15, fontWeight: '600' },
  lg: { fontSize: 16, fontWeight: '600' },
};

const variants: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: tokens.colors.action },
  subtle: { backgroundColor: tokens.colors.actionSubtleBg },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: tokens.colors.borderDefault },
  danger: { backgroundColor: tokens.colors.danger },
};

const textStyles: Record<Variant, { color: string; fontFamily?: string }> = {
  primary: { color: tokens.colors.actionFg, fontFamily: tokens.fonts.body },
  subtle: { color: tokens.colors.actionSubtleFg, fontFamily: tokens.fonts.body },
  ghost: { color: tokens.colors.fg1, fontFamily: tokens.fonts.body },
  danger: { color: '#fff', fontFamily: tokens.fonts.body },
};
