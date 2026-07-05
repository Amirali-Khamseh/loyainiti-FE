import React from 'react';
import { TextInput, View } from 'react-native';

type HoneypotFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

/**
 * Off-screen field real users never see or fill. Bots that auto-fill every
 * input on a form will populate it, so a non-empty value on submit means
 * the request came from a bot and should be rejected.
 */
export function HoneypotField({ value, onChangeText }: HoneypotFieldProps) {
  return (
    <View
      style={{ position: 'absolute', height: 0, width: 0, overflow: 'hidden' }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoComplete="off"
        importantForAutofill="no"
        tabIndex={-1}
      />
    </View>
  );
}
