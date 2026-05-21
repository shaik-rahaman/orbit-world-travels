'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, Topbar } from '@/components/layout/Navigation';
import { ChatbotPanel } from '@/components/layout/Chatbot';
import { useAuthStore } from '@/store';
import { useUIStore } from '@/store';

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <Topbar />
      <Sidebar />
      <main className={`mt-16 transition-all duration-300 p-6 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <ChatbotPanel />
    </div>
  );
}
