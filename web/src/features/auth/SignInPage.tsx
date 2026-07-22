import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Store, User } from 'lucide-react';
import { auth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { HoneypotField } from '../../components/HoneypotField';
import { useToast } from '../../components/Toast';
import { AuthLayout } from './AuthLayout';

type Form = {
  email: string;
  password: string;
  website: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState } = useForm<Form>({ mode: 'onBlur' });

  const onSubmit = handleSubmit(async (values) => {
    if (values.website) {
      // Honeypot filled in — a real user would never see or fill this field.
      return;
    }
    setSubmitting(true);
    try {
      const { website: _website, ...signInInput } = values;
      const { error: err } = await auth.signIn.email(signInInput);
      if (err) {
        toast.error(err.message ?? 'Sign-in failed');
        return;
      }
      toast.success('Signed in');
      navigate('/explore');
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
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
        <HoneypotField {...register('website')} />
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
          showPasswordToggle
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

      {/* Sign-up options */}
      <div style={{ marginTop: 24, borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
        <p className="caption" style={{ color: 'var(--fg-3)', textAlign: 'center', marginBottom: 14 }}>
          New to loyainiti? Choose your account type
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Link to="/sign-up/customer" style={{ textDecoration: 'none' }}>
            <div style={signupCardStyle}>
              <User size={20} color="var(--action)" />
              <span style={{ font: 'var(--t-body-sm)', fontWeight: 600, marginTop: 6 }}>Customer</span>
              <span style={{ font: 'var(--t-caption)', color: 'var(--fg-3)', marginTop: 2 }}>
                Collect loyalty rewards
              </span>
            </div>
          </Link>
          <Link to="/sign-up/business" style={{ textDecoration: 'none' }}>
            <div style={signupCardStyle}>
              <Store size={20} color="var(--action)" />
              <span style={{ font: 'var(--t-body-sm)', fontWeight: 600, marginTop: 6 }}>Business</span>
              <span style={{ font: 'var(--t-caption)', color: 'var(--fg-3)', marginTop: 2 }}>
                Run a loyalty programme
              </span>
            </div>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

const signupCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '14px 12px',
  borderRadius: 10,
  border: '1px solid var(--border-default)',
  background: 'var(--bg-muted)',
  cursor: 'pointer',
  transition: 'border-color var(--dur-1) var(--ease-out)',
};
