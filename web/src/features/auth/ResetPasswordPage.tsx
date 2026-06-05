/**
 * /reset-password
 *
 * The destination the email-link BE handler redirects to. URL params:
 *  - ?token=... : the verification token, BE has already validated expiry.
 *  - ?error=INVALID_TOKEN : link was bad or expired. Show recovery state.
 *
 * On submit we POST /api/auth/reset-password with { token, newPassword },
 * then send the user to /sign-in. We do NOT auto-sign-in: Better Auth's
 * reset endpoint rotates the password and returns, it does not create a
 * session, and even if it did this is a sensitive action.
 */
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { AuthLayout } from './AuthLayout';

type Form = {
  password: string;
  confirmPassword: string;
};

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState, getValues } = useForm<Form>({ mode: 'onBlur' });

  const token = params.get('token');
  const error = params.get('error');

  // Bad / expired link from the BE pre-validator: no form, just a recovery state.
  if (error || !token) {
    return (
      <AuthLayout
        title="This link is no longer valid"
        subtitle="Reset links expire after one hour, and each link only works once."
        footer={
          <span>
            <Link to="/forgot-password">Request a new link</Link> or{' '}
            <Link to="/sign-in">sign in</Link>.
          </span>
        }
      >
        <p style={{ font: 'var(--t-body)', color: 'var(--fg-2)', margin: 0 }}>
          Head back to the forgot-password page and submit your email again to get a fresh link.
        </p>
      </AuthLayout>
    );
  }

  const onSubmit = handleSubmit(async ({ password }) => {
    setSubmitting(true);
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword: password },
      });
      toast.success('Password updated - please sign in');
      navigate('/sign-in');
    } catch (e: unknown) {
      // BE returns 400/401 if the token was already used or expired between
      // pre-validation and submit. Show the message and stay on the page.
      toast.error(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Could not reset your password',
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="It must be at least 8 characters and include a letter and a number."
      footer={
        <span>
          <Link to="/sign-in">Back to sign in</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
            validate: (v) =>
              (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Must contain a letter and a number',
          })}
          error={formState.errors.password?.message}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your new password',
            validate: (v) => v === getValues('password') || 'Passwords do not match',
          })}
          error={formState.errors.confirmPassword?.message}
        />
        <Button type="submit" loading={submitting} size="lg">
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
