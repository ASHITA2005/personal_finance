import { NextRequest, NextResponse } from 'next/server';
import { createUser, createSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    if (password.length < 3) {
      return NextResponse.json({ error: 'Password must be at least 3 characters' }, { status: 400 });
    }

    const user = await createUser(username, password);
    if (!user) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Initialize default categories for new user
    db.getCategories(user.id);

    const sessionId = await createSession(user.id);
    const cookieStore = await cookies();
    
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Error signing up:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

