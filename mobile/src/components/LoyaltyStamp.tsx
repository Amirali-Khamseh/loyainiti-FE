import React from 'react';
import { View, Text } from 'react-native';
import { tokens } from '../design-system/tokens';

type Props = {
  required: number;
  earned: number;
  rewardLabel?: string;
};

export function LoyaltyStamp({ required, earned, rewardLabel }: Props) {
  const ready = earned >= required;
  const slots = Array.from({ length: required }, (_, i) => i < earned);

  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {slots.map((filled, i) => (
          <View
            key={i}
            style={{
              width: 40,
              height: 40,
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: filled ? tokens.colors.cyan500 : 'transparent',
              borderWidth: filled ? 1 : 1.5,
              borderStyle: filled ? 'solid' : 'dashed',
              borderColor: filled ? tokens.colors.cyan700 : tokens.colors.slate300,
            }}
          >
            <Text
              style={{
                fontFamily: tokens.fonts.body,
                fontWeight: '600',
                fontSize: 13,
                color: filled ? tokens.colors.slate900 : tokens.colors.slate400,
              }}
            >
              {filled ? '★' : i + 1}
            </Text>
          </View>
        ))}
      </View>
      <Text
        style={{
          marginTop: 12,
          fontFamily: tokens.fonts.body,
          fontSize: 12,
          color: ready ? tokens.colors.success : tokens.colors.fg2,
        }}
      >
        {ready
          ? `🎉 Reward ready${rewardLabel ? ` — ${rewardLabel}` : ''}`
          : `${earned} / ${required} stamps${rewardLabel ? ` — ${rewardLabel}` : ''}`}
      </Text>
    </View>
  );
}
