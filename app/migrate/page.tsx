'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MigratePage() {
  const router = useRouter();
  const [isMigrating, setIsMigrating] = useState(false);
  const [message, setMessage] = useState('');

  const handleMigrate = async () => {
    setIsMigrating(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/migrate-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed');
      }

      setMessage(`✅ ${data.message}\n\nYou can now login with:\nUsername: ashita\nPassword: ashita`);
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-yellow via-cream to-warm-yellow flex items-center justify-center p-4">
      <div className="card max-w-md w-full animate-slide-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Data Migration
          </h1>
          <p className="text-gray-600 text-sm">
            This will create user "ashita" and migrate your existing data to that account.
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-4 whitespace-pre-line ${
            message.includes('✅') 
              ? 'bg-green-100 border border-green-300 text-green-700' 
              : 'bg-red-100 border border-red-300 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleMigrate}
          disabled={isMigrating}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMigrating ? 'Migrating...' : 'Migrate Data to User "ashita"'}
        </button>

        <div className="mt-4 text-center">
          <a href="/login" className="text-sm text-gray-600 hover:text-warm-yellow">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  );
}

