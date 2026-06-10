import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { auth } from '../../src/lib/auth';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

const formInput = { backgroundColor: '#F0F4FA', color: '#052698', borderColor: 'rgba(5,38,152,0.15)' };
const formLabel = { color: '#878EA0' };

/**
 * Reset-password screen.
 *
 * Reached via the deep link `loyainiti://reset-password?token=...` that the
 * BE redirects to after pre-validating the email link. If the token is
 * invalid/expired the BE redirects with `?error=INVALID_TOKEN` instead -
 * we surface that as an error state without a form.
 *
 * Calls `auth.resetPassword({ newPassword, token })`. Reset does NOT auto
 * sign-in (Better Auth design choice), so we route back to /sign-in on
 * success.
 */
export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; error?: string }>();
  const token = typeof params.token === 'string' ? params.token : undefined;
  const errParam = typeof params.error === 'string' ? params.error : undefined;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (errParam) {
    return (
      <ScrollView
        style={{ backgroundColor: tokens.colors.bgCanvas }}
        contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
      >
        <Typo variant="label" color={tokens.colors.fg2}>Reset password</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>Link expired</Typo>
        <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          Reset links are valid for an hour. Request a new one and try again.
        </Typo>
        <View style={{ height: 24 }} />
        <Button onPress={() => router.replace('/(auth)/forgot-password')} size="lg">
          Send a new link
        </Button>
        <View style={{ height: 16 }} />
        <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
          <Typo variant="bodySm" color={tokens.colors.action} style={{ textAlign: 'center' }}>
            Back to sign in
          </Typo>
        </Pressable>
      </ScrollView>
    );
  }

  if (!token) {
    return (
      <ScrollView
        style={{ backgroundColor: tokens.colors.bgCanvas }}
        contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
      >
        <Typo variant="display2">Missing reset token</Typo>
        <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          Open the link from your reset email to continue.
        </Typo>
        <View style={{ height: 24 }} />
        <Button onPress={() => router.replace('/(auth)/forgot-password')} size="lg">
          Send a reset link
        </Button>
      </ScrollView>
    );
  }

  const validate = (): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      return 'Password must contain a letter and a number';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const submit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await auth.resetPassword({ newPassword: password, token });
      if (err) { setError(err.message ?? 'Could not reset password'); return; }
      router.replace('/(auth)/sign-in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
    >
      <Typo variant="label" color={tokens.colors.fg2}>Reset password</Typo>
      <Typo variant="display2" style={{ marginTop: 8 }}>Choose a new password</Typo>
      <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
        You'll be signed in with this on the next screen.
      </Typo>

      <View style={{ height: 24 }} />

      <Card style={{ backgroundColor: '#ffffff', borderColor: 'rgba(5,38,152,0.1)', gap: 12 }}>
        <Input
          label="New password"
          autoComplete="new-password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          hint="At least 8 characters, including a letter and a number"
          style={formInput}
          labelStyle={formLabel}
        />
        <Input
          label="Confirm new password"
          autoComplete="new-password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          style={formInput}
          labelStyle={formLabel}
        />

        {error && (
          <Text style={{ color: tokens.colors.danger, fontFamily: tokens.fonts.body }}>
            {error}
          </Text>
        )}

        <Button onPress={submit} loading={busy} size="lg">Update password</Button>
      </Card>
    </ScrollView>
  );
}
