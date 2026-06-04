import React from 'react';
import { Text, type TextProps } from 'react-native';
import { tokens } from '../design-system/tokens';

type Variant = keyof typeof tokens.type;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  children: React.ReactNode;
};

export function Typo({ variant = 'body', color, style, children, ...rest }: Props) {
  const base = tokens.type[variant];
  return (
    <Text style={[base, { color: color ?? tokens.colors.fg1 }, style]} {...rest}>
      {children}
    </Text>
  );
}
