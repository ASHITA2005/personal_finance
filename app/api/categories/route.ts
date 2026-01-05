import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Category } from '@/lib/types';
import { requireAuth } from '@/lib/api-helpers';

export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const categories = db.getCategories(user.id);
    // Sort by is_default DESC, then name ASC
    const sorted = categories.sort((a, b) => {
      if (a.is_default !== b.is_default) {
        return b.is_default - a.is_default;
      }
      return a.name.localeCompare(b.name);
    });
    return NextResponse.json(sorted);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const body = await request.json();
    const { name, color, icon } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category name already exists for this user
    const categories = db.getCategories(user.id);
    if (categories.some(cat => cat.name.toLowerCase() === name.trim().toLowerCase())) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }

    const category = db.createCategory({
      name: name.trim(),
      color: color || '#D4A574',
      icon: icon || '💰',
      is_default: 0,
    }, user.id);

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
