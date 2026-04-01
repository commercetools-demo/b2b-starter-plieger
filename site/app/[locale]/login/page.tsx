'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

import { companies } from "./org_data"
import DemoAccounts from './demoaccounts';

const PASSWORD = 'Password123!';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { addToast } = useToast();
  const { localePath } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      addToast('Signed in successfully');
      router.push(localePath('/dashboard'));
    } catch (err: any) {
      setError(err?.message ?? 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword(PASSWORD);
    doLogin(accountEmail, PASSWORD);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md mb-16 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-center mb-1">Sign In</h1>
          <p className="text-center text-sm text-gray-500 mb-8">Access the B2B Storefront</p>
          
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@vrieseco.nl"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            />
            <Button variant="primary" size="lg" loading={loading} className="w-full shadow-sm">
              Sign In
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
            <p className="text-center text-sm text-gray-600">
              <a href={localePath('/forgot-password')} className="text-primary font-medium hover:underline">Forgot password?</a>
            </p>
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <a href={localePath('/register')} className="text-primary font-medium hover:underline">Create one</a>
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Demo Accounts</h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
                Select a company below to reveal pre-configured accounts. Use these to explore different pricing, catalogs, and permission levels.
            </p>
        </div>
        <DemoAccounts companies={companies} onSelectAccount={fillCredentials} />
      </div>
    </div>
  );
}
