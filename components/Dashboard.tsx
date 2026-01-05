'use client';

import { useMemo } from 'react';
import { ExpenseWithCategory, Category } from '@/lib/types';
import { format, subDays } from 'date-fns';
import { TrendingUp, Calendar, Tag, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardProps {
  expenses: ExpenseWithCategory[];
  categories: Category[];
  onRefresh: () => void;
}

export default function Dashboard({ expenses, categories }: DashboardProps) {
  const last30Days = useMemo(() => {
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    return expenses.filter(exp => exp.date >= startDate && exp.date <= endDate);
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return last30Days.reduce((sum, exp) => sum + exp.amount, 0);
  }, [last30Days]);

  const averageDaily = useMemo(() => {
    if (last30Days.length === 0) return 0;
    const days = new Set(last30Days.map(exp => exp.date)).size;
    return days > 0 ? totalSpent / days : 0;
  }, [last30Days, totalSpent]);

  const topCategory = useMemo(() => {
    const categoryMap = new Map<number, { category: Category; total: number }>();
    last30Days.forEach(exp => {
      const current = categoryMap.get(exp.category_id) || { category: exp.category, total: 0 };
      current.total += exp.amount;
      categoryMap.set(exp.category_id, current);
    });

    const sorted = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
    return sorted[0] || null;
  }, [last30Days]);

  const pieData = useMemo(() => {
    const categoryMap = new Map<number, { name: string; value: number; color: string }>();
    last30Days.forEach(exp => {
      const current = categoryMap.get(exp.category_id) || {
        name: exp.category.name,
        value: 0,
        color: exp.category.color,
      };
      current.value += exp.amount;
      categoryMap.set(exp.category_id, current);
    });
    return Array.from(categoryMap.values());
  }, [last30Days]);

  const lineData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    last30Days.forEach(exp => {
      dailyMap.set(exp.date, (dailyMap.get(exp.date) || 0) + exp.amount);
    });

    const sortedDates = Array.from(dailyMap.keys()).sort();
    return sortedDates.map(date => ({
      date: format(new Date(date), 'MMM dd'),
      amount: dailyMap.get(date) || 0,
    }));
  }, [last30Days]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-yellow rounded-xl">
              <DollarSign className="text-gray-800" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent (30 days)</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pastel-green rounded-xl">
              <TrendingUp className="text-gray-800" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Daily</p>
              <p className="text-2xl font-bold text-gray-800">₹{averageDaily.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pastel-pink rounded-xl">
              <Tag className="text-gray-800" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Category</p>
              <p className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {topCategory ? (
                  <>
                    <span>{topCategory.category.icon}</span>
                    <span>{topCategory.category.name}</span>
                  </>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Tag size={20} />
            Category Distribution
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No expenses yet! Add some to see your spending breakdown 💛
            </div>
          )}
        </div>

        {/* Line Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Spending Over Time
          </h2>
          {lineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#D4A574"
                  strokeWidth={3}
                  dot={{ fill: '#D4A574', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No expenses yet! Add some to see your spending trends 💛
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Expenses</h2>
        {last30Days.length > 0 ? (
          <div className="space-y-3">
            {last30Days.slice(0, 5).map(expense => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-cream rounded-xl hover:bg-beige transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: expense.category.color + '40' }}
                  >
                    {expense.category.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{expense.category.name}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                      {expense.note && ` • ${expense.note}`}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-800">₹{expense.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No expenses yet! Start tracking your spending 💛
          </div>
        )}
      </div>
    </div>
  );
}

