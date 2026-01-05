import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, createUser, createSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    let user = await verifyUser(username, password);
    
    // Special case: Auto-create and migrate data for user "ashita"
    if (!user && username.toLowerCase() === 'ashita' && password === 'ashita') {
      user = await createUser('ashita', 'ashita');
      if (user) {
        // Migrate existing data to this user
        db.migrateDataToUser(user.id);
        // Initialize default categories
        db.getCategories(user.id);
      }
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

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
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}

