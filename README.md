# Unpuzzled - Google Sign-In App with Role Selection

A React application with Google OAuth authentication, role selection, and personalized dashboards.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `env.example` to `.env.local` and add your credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Google OAuth in Supabase
1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Add your Google OAuth credentials (Client ID and Client Secret)
4. Set redirect URL to: `http://localhost:5173/auth/callback` (for development)
5. **For production:** Add `https://unpuzzled-marketplace.vercel.app/**` to Redirect URLs in Authentication > URL Configuration
6. **Set Site URL** to: `https://unpuzzled-marketplace.vercel.app` (in Authentication > URL Configuration)

**See `SUPABASE_PRODUCTION_CONFIG.md` for detailed production setup instructions.**

### 4. Set up Database
Run the SQL from `supabase-schema.sql` in your Supabase SQL editor.

### 5. Start Development Server
```bash
npm run dev
```

## 🎯 Features
- ✅ Google OAuth authentication via Supabase
- ✅ Role selection (Student, Teacher, Academy Owner)
- ✅ Personalized dashboards
- ✅ Session management
- ✅ Responsive design with TailwindCSS
- ✅ TypeScript support
- ✅ Error handling and loading states

## 🛠️ Tech Stack
- React 18 + TypeScript
- Vite
- Supabase (Auth + Database)
- TailwindCSS
- React Router

## 📁 Project Structure
```
src/
├── components/          # Reusable components
├── pages/              # Page components
│   ├── Home.tsx
│   ├── RoleSelection.tsx
│   └── Dashboard.tsx
├── hooks/              # Custom hooks
│   └── useAuth.ts
├── lib/                # External library configurations
│   └── supabase.ts
├── types/              # TypeScript type definitions
│   └── auth.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 🔄 User Flow
1. **Home Page** → Click "Sign In with Google"
2. **Google OAuth** → User authenticates with Google
3. **Auth Callback** → Check if user exists in database
4. **Role Selection** (if new user) → Select role and store in database
5. **Dashboard** → Display user info and role-specific content
6. **Sign Out** → Clear session and redirect to home

## 🎨 Styling
The app uses TailwindCSS for styling with a clean, modern design:
- Gradient backgrounds
- Card-based layouts
- Responsive design
- Loading states and animations
- Role-specific color schemes

## 🔒 Security
- Row Level Security (RLS) enabled on all tables
- User can only access their own data
- Secure authentication flow through Supabase
- Environment variables for sensitive data

## 🚀 Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update Supabase redirect URLs for production domain
4. Set production environment variables

## 🐛 Troubleshooting
- **Google OAuth not working**: Check redirect URLs in Supabase and Google Console
- **Database errors**: Ensure RLS policies are set up correctly
- **Environment variables**: Make sure `.env.local` is properly configured
- **Build errors**: Check TypeScript types and imports
