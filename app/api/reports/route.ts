import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ReportData, Category } from '@/lib/types';
import { format, startOfWeek, parseISO } from 'date-fns';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Get all expenses in date range for this user
    const expenses = db.getExpenses(user.id, startDate, endDate);
    const categories = db.getCategories(user.id);
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    if (expenses.length === 0) {
      return NextResponse.json({
        totalExpenses: 0,
        categoryBreakdown: [],
        dailyTrends: [],
        weeklyTrends: [],
        monthlyTrends: [],
        highestSpendingDay: { date: startDate, total: 0 },
        topCategory: { category: null, total: 0 },
      });
    }

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Category breakdown
    const categoryTotals = new Map<number, number>();
    expenses.forEach(exp => {
      categoryTotals.set(exp.category_id, (categoryTotals.get(exp.category_id) || 0) + exp.amount);
    });

    const categoryBreakdown = Array.from(categoryTotals.entries())
      .map(([categoryId, total]) => ({
        category: categoryMap.get(categoryId)!,
        total,
        percentage: (total / totalExpenses) * 100,
      }))
      .sort((a, b) => b.total - a.total);

    // Daily trends
    const dailyMap = new Map<string, number>();
    expenses.forEach(exp => {
      dailyMap.set(exp.date, (dailyMap.get(exp.date) || 0) + exp.amount);
    });

    const dailyTrends = Array.from(dailyMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Weekly trends
    const weeklyMap = new Map<string, number>();
    expenses.forEach(exp => {
      const date = parseISO(exp.date);
      const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      weeklyMap.set(weekStart, (weeklyMap.get(weekStart) || 0) + exp.amount);
    });

    const weeklyTrends = Array.from(weeklyMap.entries())
      .map(([week, total]) => ({ week, total }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Monthly trends
    const monthlyMap = new Map<string, number>();
    expenses.forEach(exp => {
      const date = parseISO(exp.date);
      const month = format(date, 'yyyy-MM');
      monthlyMap.set(month, (monthlyMap.get(month) || 0) + exp.amount);
    });

    const monthlyTrends = Array.from(monthlyMap.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Highest spending day
    const highestDay = dailyTrends.reduce((max, day) => 
      day.total > max.total ? day : max, 
      { date: startDate, total: 0 }
    );

    // Top category
    const topCategory = categoryBreakdown.length > 0 
      ? { category: categoryBreakdown[0].category, total: categoryBreakdown[0].total }
      : { category: null, total: 0 };

    const reportData: ReportData = {
      totalExpenses,
      categoryBreakdown,
      dailyTrends,
      weeklyTrends,
      monthlyTrends,
      highestSpendingDay: highestDay,
      topCategory,
    };

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
