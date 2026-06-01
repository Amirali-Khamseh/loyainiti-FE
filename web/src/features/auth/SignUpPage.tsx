import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { auth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { AuthLayout } from './AuthLayout';

type Form = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  /**
   * On signup everyone is a 'customer' (BE enforces this; role is not a client-settable field).
   * To become a business owner the user creates a business after signup; the BE promotes them.
   * We expose a checkbox here to drive that follow-up: signup → create business → redirect to admin.
   */
  const [isBusiness, setIsBusiness] = useState(false);
  const { register, handleSubmit, formState, getValues } = useForm<Form>({ mode: 'onBlur' });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const { confirmPassword: _confirm, ...signUpInput } = values;
      const { error: err } = await auth.signUp.email(signUpInput);
      if (err) {
        toast.error(err.message ?? 'Sign-up failed');
        return;
      }
      // Explicitly fetch the session so the client store is populated before
      // we navigate to a RequireAuth-protected route. Without this, useSession()
      // may still return null and RequireAuth redirects to /sign-in.
      await auth.getSession();
      toast.success('Account created. Welcome!');
      navigate(isBusiness ? '/onboarding/business' : '/');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Sign-up failed');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the loyainiti network."
      footer={
        <span>
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
        <Input
          label="Name"
          autoComplete="name"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
            maxLength: { value: 80, message: 'Name must be 80 characters or less' },
          })}
          error={formState.errors.name?.message}
        />
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
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, including a letter and a number"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
            validate: (v) =>
              (/[A-Za-z]/.test(v) && /\d/.test(v)) ||
              'Password must contain a letter and a number',
          })}
          error={formState.errors.password?.message}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === getValues('password') || 'Passwords do not match',
          })}
          error={formState.errors.confirmPassword?.message}
        />
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            font: 'var(--t-body-sm)',
            color: 'var(--fg-2)',
          }}
        >
          <input
            type="checkbox"
            checked={isBusiness}
            onChange={(e) => setIsBusiness(e.target.checked)}
          />
          I'm signing up to run a business on loyainiti
        </label>
        <Button type="submit" loading={submitting} size="lg">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
