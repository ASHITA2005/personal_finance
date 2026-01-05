// Migration script to create user "ashita" and migrate existing data
// Run this once: npx ts-node scripts/migrate-data.ts

import { createUser, verifyUser } from '../lib/auth';
import db from '../lib/db';

async function migrateData() {
  try {
    console.log('Starting data migration...');
    
    // Check if user "ashita" already exists
    let user = await verifyUser('ashita', 'ashita');
    
    if (!user) {
      console.log('Creating user "ashita"...');
      // Create user "ashita"
      user = await createUser('ashita', 'ashita');
      if (!user) {
        throw new Error('Failed to create user');
      }
      console.log('User "ashita" created successfully!');
    } else {
      console.log('User "ashita" already exists.');
    }

    // Migrate existing data to this user
    console.log('Migrating existing data...');
    db.migrateDataToUser(user.id);
    console.log('Data migrated successfully!');

    // Initialize default categories for the user
    console.log('Initializing default categories...');
    db.getCategories(user.id);
    console.log('Default categories initialized!');

    console.log('\n✅ Migration completed successfully!');
    console.log('You can now login with:');
    console.log('  Username: ashita');
    console.log('  Password: ashita');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();

