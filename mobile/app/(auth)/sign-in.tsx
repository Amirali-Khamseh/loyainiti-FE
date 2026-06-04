import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Store } from 'lucide-react-native';
import { auth } from '../../src/lib/auth';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await auth.signIn.email({ email, password });
      if (err) {
        setError(err.message ?? 'Sign in failed');
        return;
      }
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: tokens.colors.bgCanvas,
        padding: 24,
        justifyContent: 'center',
      }}
    >
      <Typo variant="label" color={tokens.colors.fg2}>Welcome back</Typo>
      <Typo variant="display2" style={{ marginTop: 8 }}>
        Sign in
      </Typo>
      <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
        One QR code, every coffee.
      </Typo>

      <View style={{ height: 32 }} />

      <Input
        label="Email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <View style={{ height: 12 }} />
      <Input
        label="Password"
        autoComplete="current-password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && (
        <Text style={{ color: tokens.colors.danger, marginTop: 12, fontFamily: tokens.fonts.body }}>
          {error}
        </Text>
      )}

      <View style={{ height: 24 }} />
      <Button onPress={submit} loading={busy} size="lg">
        Sign in
      </Button>

      <View style={{ height: 16 }} />
      <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
        <Typo variant="bodySm" color={tokens.colors.fg2} style={{ textAlign: 'center' }}>
          Forgot your password?
        </Typo>
      </Pressable>

      {/* Sign-up options - matches the web split flow */}
      <View
        style={{
          marginTop: 32,
          paddingTop: 24,
          borderTopWidth: 1,
          borderColor: tokens.colors.borderSubtle,
        }}
      >
        <Typo
          variant="caption"
          color={tokens.colors.fg3}
          style={{ textAlign: 'center', marginBottom: 14 }}
        >
          New to loyainiti? Choose your account type
        </Typo>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => router.push('/(auth)/sign-up')}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: tokens.radius.lg,
              borderWidth: 1,
              borderColor: tokens.colors.borderDefault,
              backgroundColor: tokens.colors.bgMuted,
              alignItems: 'center',
            }}
          >
            <User color={tokens.colors.action} size={20} />
            <Typo variant="bodySm" style={{ fontWeight: '600', marginTop: 6 }}>
              Customer
            </Typo>
            <Typo
              variant="caption"
              color={tokens.colors.fg3}
              style={{ marginTop: 2, textAlign: 'center' }}
            >
              Collect loyalty rewards
            </Typo>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(auth)/sign-up-business')}
            style={{
              flex: 1,
              padding: 14,
              borderRadius: tokens.radius.lg,
              borderWidth: 1,
              borderColor: tokens.colors.borderDefault,
              backgroundColor: tokens.colors.bgMuted,
              alignItems: 'center',
            }}
          >
            <Store color={tokens.colors.action} size={20} />
            <Typo variant="bodySm" style={{ fontWeight: '600', marginTop: 6 }}>
              Business
            </Typo>
            <Typo
              variant="caption"
              color={tokens.colors.fg3}
              style={{ marginTop: 2, textAlign: 'center' }}
            >
              Run a loyalty programme
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
