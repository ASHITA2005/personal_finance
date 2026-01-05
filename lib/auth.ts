import { cookies } from 'next/headers';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface User {
  id: number;
  username: string;
  password: string; // In production, this should be hashed
  created_at: string;
}

const SESSION_COOKIE_NAME = 'finance_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';

function getUsersFile(): string {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'users.json');
}

function getSessionsFile(): string {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'sessions.json');
}

// Simple password hashing (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SESSION_SECRET).digest('hex');
}

export async function createUser(username: string, password: string): Promise<User | null> {
  const usersFile = getUsersFile();
  let users: User[] = [];
  
  if (fs.existsSync(usersFile)) {
    const data = fs.readFileSync(usersFile, 'utf-8');
    users = JSON.parse(data);
  }
  
  // Check if username already exists
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return null;
  }
  
  const newUser: User = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username,
    password: hashPassword(password),
    created_at: new Date().toISOString(),
  };
  
  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  return newUser;
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const usersFile = getUsersFile();
  
  if (!fs.existsSync(usersFile)) {
    return null;
  }
  
  const data = fs.readFileSync(usersFile, 'utf-8');
  const users: User[] = JSON.parse(data);
  
  const hashedPassword = hashPassword(password);
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === hashedPassword
  );
  
  return user || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const usersFile = getUsersFile();
  
  if (!fs.existsSync(usersFile)) {
    return null;
  }
  
  const data = fs.readFileSync(usersFile, 'utf-8');
  const users: User[] = JSON.parse(data);
  
  return users.find(u => u.id === id) || null;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionId) {
      return null;
    }
    
    const sessionsFile = getSessionsFile();
    if (!fs.existsSync(sessionsFile)) {
      return null;
    }
    
    const data = fs.readFileSync(sessionsFile, 'utf-8');
    const sessions: Record<string, number> = JSON.parse(data);
    const userId = sessions[sessionId];
    
    if (!userId) {
      return null;
    }
    
    return await getUserById(userId);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const sessionsFile = getSessionsFile();
  
  let sessions: Record<string, number> = {};
  if (fs.existsSync(sessionsFile)) {
    const data = fs.readFileSync(sessionsFile, 'utf-8');
    sessions = JSON.parse(data);
  }
  
  sessions[sessionId] = userId;
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
  
  return sessionId;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const sessionsFile = getSessionsFile();
  
  if (!fs.existsSync(sessionsFile)) {
    return;
  }
  
  const data = fs.readFileSync(sessionsFile, 'utf-8');
  const sessions: Record<string, number> = JSON.parse(data);
  delete sessions[sessionId];
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions, null, 2));
}

export { SESSION_COOKIE_NAME };
