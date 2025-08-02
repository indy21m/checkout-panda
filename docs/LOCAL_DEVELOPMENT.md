# Local Development Setup

## Database Configuration

Since your database is connected via Vercel's native Neon integration, you need to configure your local environment to use the same database.

### Step 1: Get Database URL from Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **Checkout Panda** project
3. Navigate to **Settings** → **Environment Variables**
4. Find and copy the value of `DATABASE_URL`

### Step 2: Configure Local Environment

1. Open `.env.local` in your project root
2. Replace the placeholder with your actual database URL:

```bash
# Database (copy from Vercel)
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### Step 3: Configure Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Copy your API keys from the **API Keys** section
4. Update `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
```

### Step 4: Run Database Migrations

If you haven't run migrations yet:

```bash
# Generate migration files
pnpm drizzle-kit generate:pg

# The migration SQL files are in the /migrations folder
# Apply them in your Neon console:
# 1. Go to https://console.neon.tech
# 2. Select your database
# 3. Go to SQL Editor
# 4. Copy and run each migration file
```

### Step 5: Start Development

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Your app should now be running at [http://localhost:3000](http://localhost:3000) with full database connectivity!

## Troubleshooting

### "DATABASE_URL is not set" Error

- Make sure you've saved `.env.local` after adding the database URL
- Restart your development server after changing environment variables

### tRPC Mutation Errors

- Verify your database URL is correct and includes `?sslmode=require`
- Check that all migrations have been applied
- Ensure your Clerk user ID matches the database records

### Connection Refused

- Verify your Neon database is active (not paused)
- Check that your IP is not blocked by any firewall rules
- Ensure the database URL is properly formatted

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
