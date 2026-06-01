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

/**
 * Business sign-up — creates a customer account then immediately goes into
 * the business onboarding wizard. The wizard handles the POST /api/businesses
 * call that promotes the user to business_owner.
 *
 * We await auth.getSession() after sign-up so the Better Auth client store
 * is populated before the onboarding wizard's API calls fire.
 */
export function SignUpBusinessPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
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
      // Wait for the session to be established before navigating to the
      // onboarding wizard — avoids a race where the API call fires before
      // the auth cookie is ready.
      await auth.getSession();
      toast.success('Account created. Let\'s set up your business.');
      navigate('/onboarding/business');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Sign-up failed');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthLayout
      title="Create a business account"
      subtitle="Set up your loyalty programme and start rewarding your customers."
      footer={
        <span>
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
        <Input label="Your name" autoComplete="name"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'At least 2 characters' },
          })}
          error={formState.errors.name?.message}
        />
        <Input label="Work email" type="email" autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_RE, message: 'Enter a valid email address' },
          })}
          error={formState.errors.email?.message}
        />
        <Input label="Password" type="password" autoComplete="new-password"
          hint="At least 8 characters, including a letter and a number"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
            validate: (v) =>
              (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Must contain a letter and a number',
          })}
          error={formState.errors.password?.message}
        />
        <Input label="Confirm password" type="password" autoComplete="new-password"
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === getValues('password') || 'Passwords do not match',
          })}
          error={formState.errors.confirmPassword?.message}
        />
        <Button type="submit" loading={submitting} size="lg">
          Create business account
        </Button>
      </form>
    </AuthLayout>
  );
}
