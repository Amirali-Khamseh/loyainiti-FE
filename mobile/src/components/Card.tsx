import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { tokens } from '../design-system/tokens';

type Props = {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'inverse';
  padding?: number;
  style?: ViewStyle;
};

export function Card({ children, variant = 'default', padding = 20, style }: Props) {
  return (
    <View
      style={[
        {
          borderRadius: tokens.radius.xl,
          padding,
          backgroundColor:
            variant === 'inverse'
              ? tokens.colors.bgInverse
              : variant === 'muted'
                ? tokens.colors.bgMuted
                : tokens.colors.bgCard,
          borderWidth: variant === 'inverse' ? 0 : 1,
          borderColor: tokens.colors.borderSubtle,
          ...tokens.shadow[1],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
