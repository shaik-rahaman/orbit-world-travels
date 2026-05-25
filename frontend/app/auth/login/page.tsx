'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/useApi';
import { useAuthStore } from '@/store';
import { Button, Input, Card } from '@/components/shared';

export function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: loginMutation, isPending } = useLogin();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) setErrors((prev) => ({ ...prev, email: 'Email is required' }));
    if (!password) setErrors((prev) => ({ ...prev, password: 'Password is required' }));

    if (!email || !password) return;

    loginMutation(
      { email, password },
      {
        onSuccess: (response: any) => {
          if (response.data?.data?.accessToken) {
            login(response.data.data.user, response.data.data.accessToken);
            router.push('/dashboard');
          }
        },
        onError: (error: any) => {
          const message = error.response?.data?.error?.message || 'Login failed. Please try again.';
          setError(message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-indigo-300 mb-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.svg"
                alt="Orbit World Travels Logo"
                width={64}
                height={64}
                className="w-16 h-16"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">Orbit World Travels</h1>
            <p className="text-indigo-700 font-semibold">Travel Operations Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isPending}
            className="w-full"
          >
            Login
          </Button>
          </form>
        </Card>

        {/* Demo Credentials Card */}
        <Card className="shadow-2xl border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔐</span>
              <h3 className="font-bold text-amber-900">Demo Account</h3>
            </div>
            <p className="text-sm text-amber-800 mb-3">Try the app with demo (read-only) access:</p>
            <div className="space-y-2 bg-white rounded-lg p-3 border border-amber-200">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Email</p>
                <p className="text-sm font-mono text-gray-800 break-all">demo@orbitworld.com</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Password</p>
                <p className="text-sm font-mono text-gray-800">Demo123!</p>
              </div>
            </div>
            <p className="text-xs text-amber-700 italic mt-2">Read-only access • View all data • Cannot create/edit/delete</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
