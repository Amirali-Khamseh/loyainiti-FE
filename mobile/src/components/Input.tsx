import React from 'react';
import { Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { tokens } from '../design-system/tokens';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
};

export function Input({ label, hint, error, containerStyle, style, ...rest }: Props) {
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 11,
            fontWeight: '500',
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: tokens.colors.fg2,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={tokens.colors.fg3}
        style={[
          {
            backgroundColor: tokens.colors.bgCard,
            borderWidth: 1,
            borderColor: error ? tokens.colors.danger : tokens.colors.borderDefault,
            borderRadius: tokens.radius.lg,
            paddingVertical: 12,
            paddingHorizontal: 14,
            fontFamily: tokens.fonts.body,
            fontSize: 15,
            color: tokens.colors.fg1,
          },
          style,
        ]}
        {...rest}
      />
      {(hint || error) && (
        <Text
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 12,
            color: error ? tokens.colors.danger : tokens.colors.fg3,
          }}
        >
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}
