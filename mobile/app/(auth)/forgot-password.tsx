import React, { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../src/lib/api';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      // Better Auth 1.6 renamed the endpoint from /forget-password to
      // /request-password-reset. redirectTo is the app deep link the BE
      // will redirect to after pre-validating the token - matches the scheme
      // declared in app.json.
      await api('/api/auth/request-password-reset', {
        method: 'POST',
        body: { email, redirectTo: 'loyainiti://reset-password' },
      });
      setSent(true);
    } catch (e) {
      // BE returns 200 even for unknown emails (anti-enumeration); only
      // surface unexpected failures.
      setError(e instanceof Error ? e.message : 'Could not start reset');
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
      <Typo variant="label" color={tokens.colors.fg2}>Reset password</Typo>
      <Typo variant="display2" style={{ marginTop: 8 }}>
        Forgot your password?
      </Typo>
      <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
        {sent
          ? "If an account exists for that email, we've sent a reset link. The link expires in an hour."
          : 'Enter the email you signed up with.'}
      </Typo>

      <View style={{ height: 32 }} />
      {!sent && (
        <>
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          {error && (
            <Typo variant="bodySm" color={tokens.colors.danger} style={{ marginTop: 12 }}>
              {error}
            </Typo>
          )}
          <View style={{ height: 24 }} />
          <Button onPress={submit} loading={busy} size="lg">
            Send reset link
          </Button>
        </>
      )}

      <View style={{ height: 32 }} />
      <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
        <Typo variant="bodySm" color={tokens.colors.action} style={{ textAlign: 'center' }}>
          {'←'} Back to sign in
        </Typo>
      </Pressable>
    </ScrollView>
  );
}
