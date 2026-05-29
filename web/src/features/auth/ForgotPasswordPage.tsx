import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../lib/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { AuthLayout } from './AuthLayout';

type Form = { email: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordPage() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<Form>({ mode: 'onBlur' });

  const onSubmit = handleSubmit(async ({ email }) => {
    setSubmitting(true);
    try {
      await api('/api/auth/forget-password', {
        method: 'POST',
        body: { email, redirectTo: `${window.location.origin}/sign-in` },
      });
      setSent(true);
      toast.success('Check your email for a reset link');
    } catch (e: unknown) {
      // BE returns 200 even when email is unknown (security); only surface unexpected failures.
      toast.error(e instanceof Error ? e.message : 'Could not start reset');
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
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: EMAIL_RE, message: 'Enter a valid email address' },
            })}
            error={formState.errors.email?.message}
          />
          <Button type="submit" loading={submitting} size="lg">
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
