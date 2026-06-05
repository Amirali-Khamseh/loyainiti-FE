/**
 * Star rating widget - display-only by default, interactive when onChange
 * is provided. Mirrors the web ShopPage's inline component.
 */
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { tokens } from '../design-system/tokens';

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
};

export function StarRating({ value, onChange, size = 22 }: Props) {
  const [hover, setHover] = useState(0);
  const interactive = !!onChange;
  const display = interactive ? hover || value : value;

  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Pressable
          key={s}
          disabled={!interactive}
          onPress={() => onChange?.(s)}
          onPressIn={() => interactive && setHover(s)}
          onPressOut={() => interactive && setHover(0)}
          hitSlop={4}
        >
          <Star
            size={size}
            fill={s <= display ? tokens.colors.gold500 : 'transparent'}
            color={s <= display ? tokens.colors.gold500 : tokens.colors.borderDefault}
          />
        </Pressable>
      ))}
    </View>
  );
}
