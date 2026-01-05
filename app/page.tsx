'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import CategoryManager from '@/components/CategoryManager';
import Reports from '@/components/Reports';
import { ExpenseWithCategory, Category } from '@/lib/types';
import { Plus, BarChart3, Tag, Home as HomeIcon, LogOut, User } from 'lucide-react';

type View = 'dashboard' | 'add' | 'categories' | 'reports';

export default function Home() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchExpenses();
      fetchCategories();
    }
  }, [refreshKey, currentUser]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-soft-yellow via-cream to-warm-yellow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-yellow mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-yellow via-cream to-warm-yellow">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              💛 Finance Friend
            </h1>
            <nav className="flex gap-2 items-center">
              <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-cream rounded-lg">
                <User size={16} />
                <span className="text-sm font-medium text-gray-700">{currentUser.username}</span>
              </div>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'dashboard'
                    ? 'bg-warm-yellow shadow-soft'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              >
                <HomeIcon size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={() => setCurrentView('add')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'add'
                    ? 'bg-warm-yellow shadow-soft'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Expense</span>
              </button>
              <button
                onClick={() => setCurrentView('categories')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'categories'
                    ? 'bg-warm-yellow shadow-soft'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              >
                <Tag size={18} />
                <span className="hidden sm:inline">Categories</span>
              </button>
              <button
                onClick={() => setCurrentView('reports')}
                className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'reports'
                    ? 'bg-warm-yellow shadow-soft'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">Reports</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <Dashboard expenses={expenses} categories={categories} onRefresh={handleRefresh} />
        )}
        {currentView === 'add' && (
          <div className="space-y-6">
            <ExpenseForm
              categories={categories}
              onSuccess={handleRefresh}
            />
            <ExpenseList
              expenses={expenses}
              categories={categories}
              onUpdate={handleRefresh}
            />
          </div>
        )}
        {currentView === 'categories' && (
          <CategoryManager categories={categories} onUpdate={handleRefresh} />
        )}
        {currentView === 'reports' && (
          <Reports expenses={expenses} categories={categories} />
        )}
      </main>
    </div>
  );
}

