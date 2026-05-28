import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { auth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AuthLayout } from './AuthLayout';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
type Form = z.infer<typeof schema>;

export function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  /**
   * On signup everyone is a 'customer' (BE enforces this — role is not a client-settable field).
   * To become a business owner the user creates a business after signup; the BE promotes them.
   * We expose a checkbox here to drive that follow-up: signup → create business → redirect to admin.
   */
  const [isBusiness, setIsBusiness] = useState(false);
  const { register, handleSubmit, formState } = useForm<Form>();

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      const parsed = schema.parse(values);
      const { error: err } = await auth.signUp.email(parsed);
      if (err) {
        setError(err.message ?? 'Sign-up failed');
        return;
      }
      navigate(isBusiness ? '/onboarding/business' : '/');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Sign-up failed');
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
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Name"
          autoComplete="name"
          {...register('name')}
          error={formState.errors.name?.message}
        />
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
          autoComplete="new-password"
          hint="At least 8 characters"
          {...register('password')}
          error={formState.errors.password?.message}
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
        {error && (
          <p style={{ font: 'var(--t-body-sm)', color: 'var(--danger)', margin: 0 }}>{error}</p>
        )}
        <Button type="submit" loading={submitting} size="lg">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
