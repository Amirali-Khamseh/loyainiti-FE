import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ShieldCheck } from 'lucide-react';
import { auth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';

type Form = { email: string; password: string };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Hidden, unlinked admin sign-in. Same Better Auth email/password as the public
 * app, but it lives at /_console/login and routes into the admin console. Access
 * to everything under /_console is additionally gated to role === 'admin', so a
 * non-admin who finds this page and signs in still cannot see the console.
 */
export function ConsoleLoginPage() {
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
      navigate('/_console');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'var(--bg-inverse, #1F1611)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--fg-on-dark, #FBF8F3)',
            marginBottom: 24,
          }}
        >
          <ShieldCheck size={22} />
          <span className="label" style={{ color: 'inherit' }}>
            loyainiti admin console
          </span>
        </div>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 20,
            padding: 32,
            boxShadow: 'var(--shadow-2)',
          }}
        >
          <h1 className="h1" style={{ marginBottom: 8 }}>
            Sign in
          </h1>
          <p style={{ font: 'var(--t-body-sm)', color: 'var(--fg-2)', margin: 0, marginBottom: 24 }}>
            Restricted area. Administrator accounts only.
          </p>
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
              {...register('password', { required: 'Password is required' })}
              error={formState.errors.password?.message}
            />
            <Button type="submit" loading={submitting} size="lg">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
