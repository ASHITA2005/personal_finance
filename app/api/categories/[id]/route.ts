import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Category } from '@/lib/types';
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
    const { name, color, icon } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const existing = db.getCategoryById(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if name already exists (excluding current category)
    const categories = db.getCategories(user.id);
    if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === name.trim().toLowerCase())) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }

    const category = db.updateCategory(id, {
      name: name.trim(),
      color: color || '#D4A574',
      icon: icon || '💰',
    }, user.id);

    if (!category) {
      return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
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

    const existing = db.getCategoryById(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (existing.is_default) {
      return NextResponse.json({ error: 'Cannot delete default category' }, { status: 400 });
    }

    const success = db.deleteCategory(id, user.id);
    if (!success) {
      return NextResponse.json({ error: 'Cannot delete category with existing expenses' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
