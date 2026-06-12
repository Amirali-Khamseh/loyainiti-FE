import React from 'react';
import { View } from 'react-native';
import { Card } from './Card';
import { Typo } from './Heading';
import { tokens } from '../design-system/tokens';

export function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card style={{ minWidth: 140 }}>
      <Typo variant="label" color={tokens.colors.fg3}>{label}</Typo>
      <View style={{ height: 4 }} />
      <Typo variant="numLg">{String(value)}</Typo>
      {hint ? (
        <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 6 }}>
          {hint}
        </Typo>
      ) : null}
    </Card>
  );
}
