'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExpenseWithCategory, Category, ReportData } from '@/lib/types';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart3, Calendar, TrendingUp, Award } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReportsProps {
  expenses: ExpenseWithCategory[];
  categories: Category[];
}

export default function Reports({ expenses, categories }: ReportsProps) {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const generateReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);


  const quickDateRange = (days: number) => {
    setEndDate(format(new Date(), 'yyyy-MM-dd'));
    setStartDate(format(subDays(new Date(), days), 'yyyy-MM-dd'));
  };

  const setMonthRange = () => {
    const now = new Date();
    setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warm-yellow mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="card">
        <p className="text-center text-gray-500 py-8">No data available for the selected date range.</p>
      </div>
    );
  }

  const trendData = viewMode === 'daily' 
    ? reportData.dailyTrends.map(t => ({ period: format(new Date(t.date), 'MMM dd'), amount: t.total }))
    : viewMode === 'weekly'
    ? reportData.weeklyTrends.map(t => ({ period: `Week ${format(new Date(t.week), 'MMM dd')}`, amount: t.total }))
    : reportData.monthlyTrends.map(t => ({ period: format(new Date(t.month + '-01'), 'MMM yyyy'), amount: t.total }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Range Selector */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 className="text-warm-yellow" size={28} />
          Financial Report
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => quickDateRange(7)} className="btn-secondary text-sm">
              Last 7 days
            </button>
            <button onClick={() => quickDateRange(30)} className="btn-secondary text-sm">
              Last 30 days
            </button>
            <button onClick={() => quickDateRange(90)} className="btn-secondary text-sm">
              Last 90 days
            </button>
            <button onClick={setMonthRange} className="btn-secondary text-sm">
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warm-yellow rounded-xl">
              <TrendingUp className="text-gray-800" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-800">₹{reportData.totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pastel-pink rounded-xl">
              <Award className="text-gray-800" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Category</p>
              <p className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {reportData.topCategory.category ? (
                  <>
                    <span>{reportData.topCategory.category.icon}</span>
                    <span>{reportData.topCategory.category.name}</span>
                  </>
                ) : (
                  'N/A'
                )}
              </p>
              {reportData.topCategory.total > 0 && (
                <p className="text-sm text-gray-600">₹{reportData.topCategory.total.toFixed(2)}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pastel-green rounded-xl">
              <Calendar className="text-gray-800" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Highest Spending Day</p>
              <p className="text-lg font-bold text-gray-800">
                {format(new Date(reportData.highestSpendingDay.date), 'MMM dd')}
              </p>
              <p className="text-sm text-gray-600">₹{reportData.highestSpendingDay.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown</h3>
          {reportData.categoryBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category.icon} ${percentage.toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {reportData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.category.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {reportData.categoryBreakdown.map((item) => (
                  <div key={item.category.id} className="flex items-center justify-between p-2 bg-cream rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{item.category.icon}</span>
                      <span className="font-medium">{item.category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">₹{item.total.toFixed(2)}</span>
                      <span className="text-sm text-gray-600 ml-2">({item.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No expenses in this period
            </div>
          )}
        </div>

        {/* Spending Trends */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Spending Trends</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewMode === 'daily' ? 'bg-warm-yellow' : 'bg-cream'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewMode === 'weekly' ? 'bg-warm-yellow' : 'bg-cream'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  viewMode === 'monthly' ? 'bg-warm-yellow' : 'bg-cream'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#D4A574" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

