import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Store } from 'lucide-react-native';
import { auth } from '../../src/lib/auth';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

const formInput = { backgroundColor: '#F0F4FA', color: '#052698', borderColor: 'rgba(5,38,152,0.15)' };
const formLabel = { color: '#878EA0' };

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
      if (err) { setError(err.message ?? 'Sign in failed'); return; }
      router.replace('/');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
    >
      <Typo variant="label" color={tokens.colors.fg2}>Welcome back</Typo>
      <Typo variant="display2" style={{ marginTop: 8 }}>Sign in</Typo>

      <View style={{ height: 24 }} />

      <Card style={{ backgroundColor: '#ffffff', borderColor: 'rgba(5,38,152,0.1)', gap: 12 }}>
        <Input
          label="Email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={formInput}
          labelStyle={formLabel}
        />
        <Input
          label="Password"
          autoComplete="current-password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={formInput}
          labelStyle={formLabel}
        />

        {error && (
          <Text style={{ color: tokens.colors.danger, fontFamily: tokens.fonts.body }}>
            {error}
          </Text>
        )}

        <Button onPress={submit} loading={busy} size="lg">Sign in</Button>

        <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
          <Typo variant="bodySm" color="#116BF8" style={{ textAlign: 'center' }}>
            Forgot your password?
          </Typo>
        </Pressable>
      </Card>

      <View
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTopWidth: 1,
          borderColor: tokens.colors.borderSubtle,
        }}
      >
        <Typo variant="caption" color={tokens.colors.fg3} style={{ textAlign: 'center', marginBottom: 14 }}>
          New to loyainiti? Choose your account type
        </Typo>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => router.push('/(auth)/sign-up')}
            style={{
              flex: 1, padding: 14, borderRadius: tokens.radius.lg,
              borderWidth: 1, borderColor: 'rgba(5,38,152,0.15)',
              backgroundColor: '#ffffff', alignItems: 'center',
            }}
          >
            <User color={tokens.colors.action} size={20} />
            <Typo variant="bodySm" color="#052698" style={{ fontWeight: '600', marginTop: 6 }}>Customer</Typo>
            <Typo variant="caption" color="#878EA0" style={{ marginTop: 2, textAlign: 'center' }}>
              Collect loyalty rewards
            </Typo>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(auth)/sign-up-business')}
            style={{
              flex: 1, padding: 14, borderRadius: tokens.radius.lg,
              borderWidth: 1, borderColor: 'rgba(5,38,152,0.15)',
              backgroundColor: '#ffffff', alignItems: 'center',
            }}
          >
            <Store color={tokens.colors.action} size={20} />
            <Typo variant="bodySm" color="#052698" style={{ fontWeight: '600', marginTop: 6 }}>Business</Typo>
            <Typo variant="caption" color="#878EA0" style={{ marginTop: 2, textAlign: 'center' }}>
              Run a loyalty programme
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
