# Dopamind - Digital Detox App

A comprehensive digital wellness application built with Next.js and Supabase, designed to help users break free from screen addiction and build healthier digital habits.

## 🚀 Features

- **Focus Sessions**: Pomodoro-style timer with customizable durations
- **Mood Tracking**: Log and visualize emotional states over time
- **Progress Analytics**: Track streaks, session counts, and focus time
- **User Authentication**: Secure signup/signin with Supabase Auth
- **Offline Support**: Works without internet connection using localStorage
- **Cross-Platform**: Progressive Web App (PWA) for mobile installation
- **Dark Mode**: Beautiful dark theme optimized for focus

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (for full backend functionality)
- Git

## 🔧 Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/dopamind-app.git
cd dopamind-app
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` with your Supabase credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. Set Up Supabase (Optional)

For full backend functionality, follow the detailed setup guide in `SUPABASE_SETUP.md`.

**Quick setup:**
1. Create a Supabase project
2. Run the SQL script from `scripts/create-tables-v2.sql`
3. Add your credentials to `.env.local`

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🎯 Usage

### Demo Mode
The app works immediately in demo mode without Supabase:
- All data stored in localStorage
- Full functionality available offline
- Perfect for testing and development

### Production Mode
With Supabase configured:
- Real-time data synchronization
- User authentication
- Cross-device data sync
- Secure data storage

## 📱 Mobile Installation

The app is a Progressive Web App (PWA) and can be installed on mobile devices:

1. Open the app in your mobile browser
2. Tap "Add to Home Screen" (iOS) or "Install App" (Android)
3. Use like a native app with offline support

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Database Schema

The app uses the following main tables:
- `users`: User profiles and metadata
- `mood_entries`: Mood tracking data
- `focus_sessions`: Focus session records
- `user_stats`: Aggregated user statistics
- `user_preferences`: User settings and preferences

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User data isolated by authentication
- Environment variables for sensitive data
- HTTPS enforced in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@dopamind.app
- 📖 Documentation: See `SUPABASE_SETUP.md`
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Lucide](https://lucide.dev) for the icon library
- [Tailwind CSS](https://tailwindcss.com) for styling

---

**Built with ❤️ for digital wellness**
