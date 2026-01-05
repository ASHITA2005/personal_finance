# 🚀 Deployment Guide

## ⚠️ Important Note

This app currently uses **file-based storage** (JSON files), which **won't work** on serverless platforms like Vercel or Netlify because:
- File system is read-only in serverless functions
- Data won't persist between deployments
- Multiple instances can cause data conflicts

## Recommended Deployment Options

### Option 1: Vercel + Database (Recommended) ✨

**Best for:** Production use with multiple users

1. **Set up a database:**
   - **Vercel Postgres** (easiest, built-in)
   - **Supabase** (free tier, PostgreSQL)
   - **MongoDB Atlas** (free tier)
   - **PlanetScale** (free tier, MySQL)

2. **Update the code:**
   - Replace file-based storage with database queries
   - Update `lib/db.ts` to use your chosen database

3. **Deploy to Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```
   Or connect your GitHub repo to Vercel for automatic deployments.

4. **Add environment variables** in Vercel dashboard:
   - Database connection strings
   - Session secret

**Pros:**
- ✅ Best Next.js support
- ✅ Automatic deployments
- ✅ Free tier available
- ✅ Scales automatically

---

### Option 2: Railway / Render (Easier Migration)

**Best for:** Quick deployment without code changes

1. **Railway** (recommended):
   - Push your code to GitHub
   - Connect Railway to your repo
   - Railway provides persistent storage
   - Free tier available

2. **Render**:
   - Similar to Railway
   - Free tier available
   - Persistent file system

**Pros:**
- ✅ Works with current file-based storage
- ✅ No code changes needed
- ✅ Easy setup

**Cons:**
- ⚠️ Less optimized for Next.js than Vercel
- ⚠️ May need to configure build settings

---

### Option 3: Self-Hosted (VPS)

**Best for:** Full control, learning experience

1. **DigitalOcean Droplet** ($5/month)
2. **Linode** ($5/month)
3. **AWS EC2** (free tier available)

**Steps:**
```bash
# On your server
git clone your-repo
cd personal_proj
npm install
npm run build
npm start
```

**Pros:**
- ✅ Full control
- ✅ File storage works perfectly
- ✅ Can add custom features

**Cons:**
- ⚠️ Need to manage server yourself
- ⚠️ Need to set up SSL, domain, etc.

---

## Quick Start: Deploy to Railway (Easiest)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Go to Railway.app:**
   - Sign up with GitHub
   - Click "New Project"
   - Select your repository
   - Railway auto-detects Next.js

3. **Add environment variable** (optional):
   - `SESSION_SECRET` = any random string

4. **Deploy:**
   - Railway will automatically build and deploy
   - Get your app URL

5. **Access your app:**
   - Visit the Railway URL
   - Login with `ashita` / `ashita`
   - Your data persists! 🎉

---

## Quick Start: Deploy to Vercel (Best Performance)

### Step 1: Set up Supabase (Free Database)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Settings → Database

### Step 2: Update Code for Database

You'll need to replace `lib/db.ts` with database queries. Here's a quick example structure:

```typescript
// Example: Using Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Then replace file operations with Supabase queries
```

### Step 3: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SESSION_SECRET`

4. **Done!** Your app is live 🎉

---

## Environment Variables Needed

Create a `.env.local` file (for local development) and add these to your hosting platform:

```env
SESSION_SECRET=your-random-secret-key-here
# If using database:
DATABASE_URL=your-database-connection-string
```

---

## Which Should You Choose?

- **Just want it working quickly?** → **Railway** (no code changes)
- **Want best performance?** → **Vercel + Supabase** (requires database migration)
- **Want to learn/control everything?** → **Self-hosted VPS**

---

## Need Help?

If you want me to help migrate to a database for Vercel deployment, just ask! I can update the code to use Supabase, Vercel Postgres, or MongoDB.

