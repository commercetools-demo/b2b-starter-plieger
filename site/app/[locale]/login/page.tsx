'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useLocale } from '@/context/LocaleContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DEMO_COMPANIES = [
  {
    name: 'J. Krens Installatietechniek',
    store: 'Krens Delft',
    description: 'Large enterprise',
    accounts: [
      { email: 'jan@krens.nl', role: 'Admin' },
      { email: 'carola@krens.nl', role: 'Approver' },
      { email: 'bob@krens.nl', role: 'Buyer' },
    ],
  },
  {
    name: 'Krens Pijnacker',
    store: 'Krens Pijnacker Store',
    description: 'Mid-size company — sees standard pricing for same products',
    accounts: [
      { email: 'jan@krens.nl', role: 'Admin' },
      { email: 'carola@krens.nl', role: 'Approver' },
      { email: 'bob@krens.nl', role: 'Buyer' },
    ],
  },
  {
    name: 'Krens Bleiswijk',
    store: 'Krens Bleiswijk Store',
    description: 'European company — sees EUR/GBP pricing and regional catalog',
    accounts: [
      { email: 'jan@krens.nl', role: 'Admin' },
      { email: 'carola@krens.nl', role: 'Approver' },
      { email: 'bob@krens.nl', role: 'Buyer' },
    ],
  },
];

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="primary" size="lg" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            <a href={localePath('/forgot-password')} className="text-primary font-medium hover:underline">Forgot password?</a>
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href={localePath('/register')} className="text-primary font-medium hover:underline">Create one</a>
          </p>
        </div>

        {/* Demo Accounts by Company */}
        <div className="mt-8">
          <div className="text-center mb-4">
            <h2 className="text-sm font-semibold text-slate-700">Demo Accounts</h2>
            <p className="text-xs text-slate-500 mt-1">
              Log in as different companies to see different products and prices.
              All passwords: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">123</code>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_COMPANIES.map((company) => (
              <div
                key={company.name}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <h3 className="text-sm font-semibold text-slate-900 leading-tight">{company.name}</h3>
                <p className="text-xs text-primary font-medium mt-0.5">{company.store}</p>
                <p className="text-xs text-slate-500 mt-1 mb-3">{company.description}</p>
                <div className="space-y-1.5">
                  {company.accounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => fillCredentials(account.email)}
                      className="w-full text-left rounded-md border border-slate-150 px-3 py-2 hover:border-red-300 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700">{account.role}</span>
                        <span className="text-[10px] font-mono text-slate-400">{account.email}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400 text-center">Click any account to fill credentials, then sign in</p>
        </div>
      </div>
    </div>
  );
}
