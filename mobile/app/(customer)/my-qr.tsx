import React, { useState, useEffect } from 'react';
import { ScrollView, View, Image, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../src/lib/api';
import { API_URL } from '../../src/lib/auth';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

type Me = {
  userId: string;
  email: string;
  displayName: string;
  qrCodeId: string;
};

const TOKEN_KEY = 'loyainiti.session_token';

export default function MyQr() {
  const me = useQuery({ queryKey: ['me'], queryFn: () => api<Me>('/api/me') });
  const [qrUri, setQrUri] = useState<string | null>(null);

  useEffect(() => {
    if (!me.data) return;
    let cancelled = false;

    (async () => {
      try {
        const isWeb = Platform.OS === 'web';
        const token = isWeb ? null : await SecureStore.getItemAsync(TOKEN_KEY);
        const res = await fetch(`${API_URL}/api/me/qr.png`, {
          credentials: isWeb ? 'include' : 'same-origin',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (!cancelled && typeof reader.result === 'string') {
            setQrUri(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch {
        // silently fail — placeholder remains
      }
    })();

    return () => { cancelled = true; };
  }, [me.data?.userId]);

  if (me.isLoading) return null;
  if (!me.data) return null;

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>Your loyalty card</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Show at the till
        </Typo>
        <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          Any shop in the network can scan this.
        </Typo>
      </View>

      <Card padding={24} style={{ alignItems: 'center', gap: 20 }}>
        <View
          style={{
            padding: 16,
            backgroundColor: tokens.colors.bgCard,
            borderRadius: tokens.radius.md,
            borderWidth: 1,
            borderColor: tokens.colors.borderSubtle,
          }}
        >
          {qrUri ? (
            <Image
              source={{ uri: qrUri }}
              style={{ width: 280, height: 280 }}
              resizeMode="contain"
            />
          ) : (
            <View style={{ width: 280, height: 280, alignItems: 'center', justifyContent: 'center' }}>
              <Typo variant="caption" color={tokens.colors.fg3}>Loading QR code…</Typo>
            </View>
          )}
        </View>

        <View style={{ alignItems: 'center' }}>
          <Typo variant="label" color={tokens.colors.fg3}>Code</Typo>
          <Typo variant="numLg" style={{ marginTop: 4 }}>{me.data.qrCodeId}</Typo>
          <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 4 }}>
            If a shop can't scan, read out the code above.
          </Typo>
        </View>

        <View
          style={{
            width: '100%',
            borderTopWidth: 1,
            borderColor: tokens.colors.borderSubtle,
            paddingTop: 16,
          }}
        >
          <Typo variant="label" color={tokens.colors.fg3}>Account</Typo>
          <Typo variant="body" style={{ marginTop: 4 }}>
            {me.data.displayName}
          </Typo>
          <Typo variant="caption" color={tokens.colors.fg2} style={{ marginTop: 2 }}>
            {me.data.email}
          </Typo>
          <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 4, fontFamily: tokens.fonts.mono }}>
            user_id: {me.data.userId}
          </Typo>
        </View>
      </Card>
    </ScrollView>
  );
}
