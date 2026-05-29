import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { auth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { AuthLayout } from './AuthLayout';

type Form = {
  email: string;
  password: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<Form>({ mode: 'onBlur' });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const { error: err } = await auth.signIn.email(values);
      if (err) {
        toast.error(err.message ?? 'Sign-in failed');
        return;
      }
      toast.success('Signed in');
      navigate('/');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your loyainiti account."
      footer={
        <span>
          New here? <Link to="/sign-up">Create an account</Link>
        </span>
      }
    >
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
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
          error={formState.errors.password?.message}
        />
        <Button type="submit" loading={submitting} size="lg">
          Sign in
        </Button>
        <Link
          to="/forgot-password"
          style={{ font: 'var(--t-body-sm)', textAlign: 'center', color: 'var(--fg-2)' }}
        >
          Forgot your password?
        </Link>
      </form>
    </AuthLayout>
  );
}
