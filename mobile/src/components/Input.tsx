import React, { useState } from 'react';
import { Text, TextInput, View, Pressable, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { tokens } from '../design-system/tokens';

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  showPasswordToggle?: boolean;
};

export function Input({
  label,
  hint,
  error,
  containerStyle,
  labelStyle,
  style,
  showPasswordToggle,
  secureTextEntry,
  ...rest
}: Props) {
  const [shown, setShown] = useState(false);
  const isPassword = secureTextEntry || showPasswordToggle;

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && (
        <Text
          style={[{
            fontFamily: tokens.fonts.body,
            fontSize: 11,
            fontWeight: '500',
            letterSpacing: 1.1,
            textTransform: 'uppercase',
            color: tokens.colors.fg2,
          }, labelStyle]}
        >
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholderTextColor={tokens.colors.fg3}
          secureTextEntry={isPassword ? !shown : false}
          style={[
            {
              backgroundColor: tokens.colors.bgCard,
              borderWidth: 1,
              borderColor: error ? tokens.colors.danger : tokens.colors.borderDefault,
              borderRadius: tokens.radius.lg,
              paddingVertical: 12,
              paddingHorizontal: 14,
              paddingRight: isPassword ? 44 : 14,
              fontFamily: tokens.fonts.body,
              fontSize: 15,
              color: tokens.colors.fg1,
            },
            style,
          ]}
          {...rest}
        />
        {isPassword && (
          <Pressable
            onPress={() => setShown((s) => !s)}
            style={{
              position: 'absolute',
              right: 12,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              padding: 4,
            }}
            hitSlop={8}
          >
            {shown
              ? <EyeOff size={18} color={tokens.colors.fg3} />
              : <Eye size={18} color={tokens.colors.fg3} />}
          </Pressable>
        )}
      </View>
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
