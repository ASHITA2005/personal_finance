import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { ExpenseWithCategory } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const id = parseInt(params.id);
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

    // Verify expense exists and belongs to user
    const existing = db.getExpenseById(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Verify category exists and belongs to user
    const category = db.getCategoryById(category_id, user.id);
    if (!category) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const expense = db.updateExpense(id, {
      amount,
      date,
      category_id,
      note: note || undefined,
    }, user.id);

    if (!expense) {
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }

    const formattedExpense: ExpenseWithCategory = {
      ...expense,
      category,
    };

    return NextResponse.json(formattedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const id = parseInt(params.id);

    const existing = db.getExpenseById(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    const success = db.deleteExpense(id, user.id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
