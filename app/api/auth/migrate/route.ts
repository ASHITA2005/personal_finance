import { NextResponse } from 'next/server';
import { verifyUser } from '@/lib/auth';
import db from '@/lib/db';

// This route migrates existing data to a user account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await verifyUser(username, password);
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Migrate existing data to this user
    db.migrateDataToUser(user.id);

    return NextResponse.json({ success: true, message: 'Data migrated successfully' });
  } catch (error) {
    console.error('Error migrating data:', error);
    return NextResponse.json({ error: 'Failed to migrate data' }, { status: 500 });
  }
}

