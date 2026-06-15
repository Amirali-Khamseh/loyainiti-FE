import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { Modal } from './Modal';
import { Typo } from './Heading';
import { tokens } from '../design-system/tokens';

export type SelectOption = { label: string; value: string };

type Props = {
  label?: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  error?: string;
  containerStyle?: object;
};

/**
 * Dropdown field for React Native: a tappable field (styled like Input) that
 * opens a Modal with a scrollable option list. Used for the country picker on
 * sign-up and the country/city filters on Explore.
 */
export function SelectField({ label, value, options, placeholder = 'Select…', onChange, error, containerStyle }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

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
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: tokens.colors.bgCard,
          borderWidth: 1,
          borderColor: error ? tokens.colors.danger : tokens.colors.borderDefault,
          borderRadius: tokens.radius.lg,
          paddingVertical: 12,
          paddingHorizontal: 14,
        }}
      >
        <Text
          style={{
            fontFamily: tokens.fonts.body,
            fontSize: 15,
            color: selected ? tokens.colors.fg1 : tokens.colors.fg3,
          }}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={16} color={tokens.colors.fg3} />
      </Pressable>
      {error && (
        <Text style={{ fontFamily: tokens.fonts.body, fontSize: 12, color: tokens.colors.danger }}>
          {error}
        </Text>
      )}

      <Modal visible={open} onClose={() => setOpen(false)} cardStyle={{ maxHeight: '80%', padding: 0 }}>
        <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: tokens.colors.borderSubtle }}>
          <Typo variant="h3">{label ?? 'Select'}</Typo>
        </View>
        <ScrollView style={{ maxHeight: 360 }}>
          {options.map((o, i) => {
            const on = o.value === value;
            return (
              <Pressable
                key={`${o.value}-${i}`}
                onPress={() => { onChange(o.value); setOpen(false); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: i < options.length - 1 ? 1 : 0,
                  borderBottomColor: tokens.colors.borderSubtle,
                }}
              >
                <Typo variant="body" color={on ? tokens.colors.action : tokens.colors.fg1}>
                  {o.label}
                </Typo>
                {on && <Check size={16} color={tokens.colors.action} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </Modal>
    </View>
  );
}
