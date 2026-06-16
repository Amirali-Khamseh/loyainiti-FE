import React, { useEffect, useRef } from 'react';
import { Animated, View, type DimensionValue, type ViewStyle } from 'react-native';
import { tokens } from '../design-system/tokens';

/**
 * Loading-state placeholders for React Native. A subtle opacity pulse stands in
 * for the web's shimmer sweep (cheap, runs on the native driver). Use `Skeleton`
 * for a single block and the composites below to mirror real content.
 */

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 14, radius = tokens.radius.sm, style }: SkeletonProps) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: tokens.colors.borderSubtle, opacity: pulse },
        style,
      ]}
    />
  );
}

type SkeletonTextProps = {
  lines?: number;
  lineHeight?: number;
  lastWidth?: DimensionValue;
  gap?: number;
  style?: ViewStyle;
};

/** A stack of bars approximating a paragraph; the last line is shortened. */
export function SkeletonText({
  lines = 3,
  lineHeight = 12,
  lastWidth = '60%',
  gap = 8,
  style,
}: SkeletonTextProps) {
  return (
    <View style={[{ gap }, style]}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={lineHeight} width={i === lines - 1 ? lastWidth : '100%'} />
      ))}
    </View>
  );
}

/** Mirrors the explore shop card (optional cover, logo + title, text lines). */
export function SkeletonCard({ showCover = true }: { showCover?: boolean }) {
  return (
    <View
      style={{
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: tokens.colors.borderSubtle,
        backgroundColor: tokens.colors.bgCard,
        overflow: 'hidden',
      }}
    >
      {showCover && <Skeleton height={120} radius={0} />}
      <View style={{ padding: 20, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Skeleton width={32} height={32} radius={6} />
          <Skeleton width="55%" height={18} />
        </View>
        <SkeletonText lines={2} lastWidth="80%" />
      </View>
    </View>
  );
}
