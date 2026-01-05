import { NextResponse } from 'next/server';
import { createUser, verifyUser } from '@/lib/auth';
import db from '@/lib/db';

// This route creates user "ashita" and migrates existing data
export async function POST() {
  try {
    // Check if user "ashita" already exists
    let user = await verifyUser('ashita', 'ashita');
    
    if (!user) {
      // Create user "ashita"
      user = await createUser('ashita', 'ashita');
      if (!user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    // Migrate existing data to this user
    db.migrateDataToUser(user.id);

    // Initialize default categories for the user
    db.getCategories(user.id);

    return NextResponse.json({ 
      success: true, 
      message: 'User created and data migrated successfully',
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Error migrating data:', error);
    return NextResponse.json({ error: 'Failed to migrate data' }, { status: 500 });
  }
}

