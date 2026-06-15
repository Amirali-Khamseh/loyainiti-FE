import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { auth } from '../../lib/auth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { CountrySelect } from '../../components/CountrySelect';
import { useToast } from '../../components/Toast';
import { AuthLayout } from './AuthLayout';

type Form = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  city: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Customer sign-up — redirects to the explore page after account creation. */
export function SignUpPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [country, setCountry] = useState('');
  const [countryError, setCountryError] = useState<string | undefined>();
  const { register, handleSubmit, formState, getValues } = useForm<Form>({ mode: 'onBlur' });

  const onSubmit = handleSubmit(async (values) => {
    if (!country) {
      setCountryError('Country is required');
      return;
    }
    setSubmitting(true);
    try {
      const { confirmPassword: _confirm, ...signUpInput } = values;
      const { error: err } = await auth.signUp.email({ ...signUpInput, country });
      if (err) {
        toast.error(err.message ?? 'Sign-up failed');
        return;
      }
      toast.success('Account created. Welcome!');
      navigate('/');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Sign-up failed');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthLayout
      title="Create a customer account"
      subtitle="Collect stamps and unlock rewards at every shop in the network."
      footer={
        <span>
          Already have an account? <Link to="/sign-in">Sign in</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
        <Input label="Name" autoComplete="name"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'At least 2 characters' },
          })}
          error={formState.errors.name?.message}
        />
        <Input label="Email" type="email" autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_RE, message: 'Enter a valid email address' },
          })}
          error={formState.errors.email?.message}
        />
        <CountrySelect
          value={country}
          onChange={(v) => { setCountry(v); setCountryError(undefined); }}
          error={countryError}
        />
        <Input label="City" autoComplete="address-level2"
          hint="We'll show you shops in your city first"
          {...register('city', {
            required: 'City is required',
            minLength: { value: 2, message: 'At least 2 characters' },
          })}
          error={formState.errors.city?.message}
        />
        <Input label="Password" type="password" autoComplete="new-password" showPasswordToggle
          hint="At least 8 characters, including a letter and a number"
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
            validate: (v) =>
              (/[A-Za-z]/.test(v) && /\d/.test(v)) || 'Must contain a letter and a number',
          })}
          error={formState.errors.password?.message}
        />
        <Input label="Confirm password" type="password" autoComplete="new-password" showPasswordToggle
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === getValues('password') || 'Passwords do not match',
          })}
          error={formState.errors.confirmPassword?.message}
        />
        <Button type="submit" loading={submitting} size="lg">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
