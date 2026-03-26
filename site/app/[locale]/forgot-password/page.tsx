'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const { localePath } = useLocale();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
          {submitted ? (
            <div className="text-center py-4">
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
                If an account exists with that email, you&apos;ll receive a reset link shortly.
              </div>
              <Link href={localePath('/login')} className="text-primary font-medium hover:underline text-sm">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 text-center mb-6">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button variant="primary" size="lg" loading={loading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-600">
                <Link href={localePath('/login')} className="text-primary font-medium hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
