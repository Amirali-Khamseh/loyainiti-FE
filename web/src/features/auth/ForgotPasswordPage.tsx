import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '../../lib/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AuthLayout } from './AuthLayout';

const schema = z.object({ email: z.string().email() });
type Form = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<Form>();

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null);
    setSubmitting(true);
    try {
      await api('/api/auth/forget-password', {
        method: 'POST',
        body: { email, redirectTo: `${window.location.origin}/sign-in` },
      });
      setSent(true);
    } catch (e: unknown) {
      // BE returns 200 even when email is unknown (security); only surface unexpected failures.
      setError(e instanceof Error ? e.message : 'Could not start reset');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        sent
          ? "If an account exists for that address, we've sent a reset link."
          : 'Enter the email you signed up with.'
      }
      footer={
        <span>
          Remembered it? <Link to="/sign-in">Back to sign in</Link>
        </span>
      }
    >
      {sent ? (
        <p style={{ font: 'var(--t-body)', color: 'var(--fg-2)', margin: 0 }}>
          In development the link is printed to the backend logs (no email is sent yet).
        </p>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...register('email')}
            error={formState.errors.email?.message}
          />
          {error && (
            <p style={{ font: 'var(--t-body-sm)', color: 'var(--danger)', margin: 0 }}>{error}</p>
          )}
          <Button type="submit" loading={submitting} size="lg">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
