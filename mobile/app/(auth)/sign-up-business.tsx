import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../../src/lib/auth';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

/**
 * Business sign-up - creates the account then routes straight to the
 * business profile onboarding screen. We await auth.getSession() after
 * sign-up so the bearer token from @better-auth/expo is persisted before
 * the next page's API calls fire.
 */
export default function SignUpBusiness() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const validate = (): string | null => {
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      return 'Password must contain a letter and a number';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await auth.signUp.email({ email, password, name });
      if (err) {
        setError(err.message ?? 'Sign up failed');
        return;
      }
      // Wait for session to be persisted before the next screen's API calls
      // fire - same fix as the web SignUpBusinessPage.
      await auth.getSession();
      router.replace('/(business)/business?onboarding=1');
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
      <Typo variant="label" color={tokens.colors.fg2}>For business</Typo>
      <Typo variant="display2" style={{ marginTop: 8 }}>
        Create a business account
      </Typo>
      <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
        Set up your loyalty programme and start rewarding your customers.
      </Typo>

      <View style={{ height: 32 }} />
      <Input label="Your name" autoComplete="name" value={name} onChangeText={setName} />
      <View style={{ height: 12 }} />
      <Input
        label="Work email"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <View style={{ height: 12 }} />
      <Input
        label="Password"
        autoComplete="new-password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        hint="At least 8 characters, including a letter and a number"
      />
      <View style={{ height: 12 }} />
      <Input
        label="Confirm password"
        autoComplete="new-password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      {error && (
        <Text style={{ color: tokens.colors.danger, marginTop: 12, fontFamily: tokens.fonts.body }}>
          {error}
        </Text>
      )}

      <View style={{ height: 24 }} />
      <Button onPress={submit} loading={busy} size="lg">
        Create business account
      </Button>

      <View
        style={{
          marginTop: 32,
          paddingTop: 24,
          borderTopWidth: 1,
          borderColor: tokens.colors.borderSubtle,
        }}
      >
        <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
          <Typo variant="bodySm" color={tokens.colors.fg2} style={{ textAlign: 'center' }}>
            Already have one? <Text style={{ color: tokens.colors.action }}>Sign in</Text>
          </Typo>
        </Pressable>
      </View>
    </ScrollView>
  );
}
