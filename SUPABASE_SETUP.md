# Supabase Setup Guide for Dopamind

This guide will walk you through setting up Supabase for full backend functionality in your Dopamind app.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `dopamind-app`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

**Important**: Replace the placeholder values with your actual Supabase credentials.

## 4. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the SQL from `scripts/create-tables.sql`
4. Click "Run" to execute the script

## 5. Configure Authentication

### Enable Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email templates if desired

### Enable Google OAuth (Optional)
1. In **Authentication** → **Settings** → **Auth Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Add authorized redirect URLs:
   - `https://your-project-id.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

## 6. Set Up Row Level Security (RLS)

The SQL script automatically enables RLS and creates policies, but you can verify:

1. Go to **Authentication** → **Policies**
2. Verify policies exist for all tables:
   - `users`: View/update own profile
   - `mood_entries`: Full CRUD for own entries
   - `focus_sessions`: View/insert/update own sessions
   - `user_stats`: View/insert/update own stats

## 7. Test Your Setup

1. Restart your development server: `npm run dev`
2. Navigate to `/auth/signup`
3. Create a test account
4. Verify you can:
   - Sign up and sign in
   - Complete focus sessions
   - Log mood entries
   - View profile data

## 8. Production Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Update Supabase auth settings with your production URL

### Update Supabase Settings
1. In **Authentication** → **Settings** → **Site URL**
2. Add your production domain: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

## 9. Optional: Set Up Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Magic link
   - Change email address
   - Reset password

## 10. Monitoring and Analytics

1. **Database**: Monitor usage in **Settings** → **Usage**
2. **Auth**: View user activity in **Authentication** → **Users**
3. **Logs**: Check **Logs** section for errors

## Troubleshooting

### Common Issues

**"Invalid API key" error:**
- Verify your environment variables are correct
- Restart your development server
- Check for typos in `.env.local`

**RLS policy errors:**
- Ensure you ran the complete SQL script
- Check that policies are enabled in the dashboard
- Verify user authentication is working

**CORS errors:**
- Add your domain to allowed origins in Supabase settings
- Check that redirect URLs are properly configured

**Database connection issues:**
- Verify your project is not paused (free tier limitation)
- Check Supabase status page for outages

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use RLS policies** for all tables (already configured)
3. **Regularly rotate API keys** in production
4. **Monitor auth logs** for suspicious activity
5. **Set up database backups** for production
6. **Use HTTPS only** in production

## Next Steps

Once Supabase is configured, you can:
- Enable real-time subscriptions for live updates
- Set up database functions for complex operations
- Add file storage for user avatars
- Implement push notifications
- Set up automated backups
