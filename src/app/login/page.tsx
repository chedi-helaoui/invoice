"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.scss';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { signInAction } from '@/app/auth/actions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const result = await signInAction(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Failed to sign in');
      return;
    }

    router.push(redirect);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>Sign in to your Fiscal Atelier account.</p>
        <form className={styles.form} onSubmit={handleSignIn}>
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
            {loading ? 'Please wait…' : 'Sign In'}
          </Button>
        </form>
        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.container}><div className={styles.card}><h1 className={styles.heading}>Loading...</h1></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
