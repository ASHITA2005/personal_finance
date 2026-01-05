import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Expense, ExpenseWithCategory } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const expenses = db.getExpenses(
      user.id,
      startDate || undefined,
      endDate || undefined
    );

    const categories = db.getCategories(user.id);
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

    const formattedExpenses: ExpenseWithCategory[] = expenses.map(exp => ({
      ...exp,
      category: categoryMap.get(exp.category_id)!,
    }));

    return NextResponse.json(formattedExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const body = await request.json();
    const { amount, date, category_id, note } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    if (!category_id) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Verify category exists and belongs to user
    const category = db.getCategoryById(category_id, user.id);
    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const expense = db.createExpense({
      amount,
      date,
      category_id,
      note: note || undefined,
    }, user.id);

    const formattedExpense: ExpenseWithCategory = {
      ...expense,
      category,
    };

    return NextResponse.json(formattedExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
