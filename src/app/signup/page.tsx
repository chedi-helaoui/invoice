"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '@/app/login/page.module.scss';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { signUpAction, verifyEmailAction, resendVerificationAction } from '@/app/auth/actions';

export default function SignUpPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'signup' | 'verify'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('name', name);

    const result = await signUpAction(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to sign up');
      return;
    }

    if (result.requireVerification) {
      setMode('verify');
    } else {
      router.push('/');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp', otp);

    const result = await verifyEmailAction(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to verify');
      return;
    }

    router.push('/');
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('email', email);
    const result = await resendVerificationAction(formData);
    if (!result.success) {
      setError(result.error || 'Failed to resend code');
    } else {
      setMessage('Verification code resent successfully.');
    }
  };

  if (mode === 'verify') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Check your email</h1>
          <p className={styles.subheading}>We sent a 6-digit code to {email}</p>
          <form className={styles.form} onSubmit={handleVerify}>
            <p className={styles.otpNote}>Enter the verification code below</p>
            <Input
              label="Verification Code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Email'}
            </Button>
          </form>
          <p className={styles.footer}>
            <button className={styles.link} type="button" onClick={handleResend}>
              Resend code
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.subheading}>Start managing your invoices.</p>
        <form className={styles.form} onSubmit={handleSignUp}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className={styles.error}>{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Please wait…' : 'Create Account'}
          </Button>
        </form>
        <p className={styles.footer}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
