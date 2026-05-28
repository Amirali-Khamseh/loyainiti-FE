import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { auth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AuthLayout } from './AuthLayout';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
type Form = z.infer<typeof schema>;

export function SignInPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<Form>();

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      const parsed = schema.parse(values);
      const { error: err } = await auth.signIn.email(parsed);
      if (err) {
        setError(err.message ?? 'Sign-in failed');
        return;
      }
      navigate('/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
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
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={formState.errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={formState.errors.password?.message}
        />
        {error && (
          <p style={{ font: 'var(--t-body-sm)', color: 'var(--danger)', margin: 0 }}>{error}</p>
        )}
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
