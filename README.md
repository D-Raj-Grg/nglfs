# NGLFS - Anonymous Messaging Platform

**Live Demo**: [https://nglfs.vercel.app](https://nglfs.vercel.app)

NGLFS is a modern anonymous messaging platform built with Next.js 16, React 19, and TypeScript. Users create profiles with unique usernames and receive anonymous messages from anyone who visits their public profile link. The platform emphasizes modern UI/UX with glassmorphism effects, gradient accents, and smooth animations.

## Features

- **Anonymous Messaging**: Send and receive messages without revealing sender identity
- **Unique Profile Links**: Each user gets a shareable `/[username]` link
- **Modern UI/UX**: Glassmorphism design with gradient accents and smooth animations
- **Dark Mode**: System-aware dark/light theme support with next-themes
- **Real-time Updates**: Live message notifications (via Supabase)
- **Analytics Dashboard**: Track profile visits and message engagement
- **Rate Limiting**: Built-in abuse prevention with IP-based rate limits
- **Mobile-First**: Responsive design optimized for all devices

## Tech Stack

### Core Framework
- **Next.js 16.0.1** - React framework with App Router and Server Components
- **React 19.2.0** - Latest React with improved Server Components
- **TypeScript 5** - Type-safe development with strict mode
- **Node.js** - Runtime environment

### Styling & UI Components
- **Tailwind CSS v4** - Utility-first CSS framework
- **Shadcn/ui** - Accessible component library built on Radix UI primitives
- **Magic UI** - 150+ animated components for visual effects
- **Next-themes 0.4.6** - Dark mode support with system detection
- **Geist Font** - Modern font family by Vercel

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
  - PostgreSQL database
  - Authentication & session management
  - Row Level Security (RLS)
  - Real-time subscriptions
- **@supabase/ssr 0.5.2** - Server-side rendering helpers
- **@supabase/supabase-js 2.47.10** - JavaScript client library

### Form Handling & Validation (Planned)
- **React Hook Form** - Performant form state management
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration for React Hook Form

### Data Fetching & State (Planned)
- **TanStack Query (React Query)** - Async state management
- **TanStack Table** - Headless table component

### UI Components & Animations
- **Sonner** - Toast notifications
- **Radix UI** - Unstyled, accessible component primitives
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-separator
  - @radix-ui/react-slot
  - @radix-ui/react-toggle
  - @radix-ui/react-tooltip
- **Lucide React** - Icon library
- **clsx** - Conditional className utility
- **tailwind-merge** - Merge Tailwind classes without conflicts

### Developer Tools
- **ESLint** - Code linting with Next.js config
- **PostCSS** - CSS processing
- **pnpm** - Fast, disk space efficient package manager

## Project Structure

```
nglfs-frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout with providers
│   ├── page.tsx               # Landing page
│   ├── (auth)/                # Auth route group
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── reset-password/    # Password reset
│   ├── (dashboard)/           # Protected dashboard group
│   │   └── dashboard/
│   │       ├── messages/      # Message inbox
│   │       ├── analytics/     # Analytics dashboard
│   │       └── settings/      # User settings
│   ├── [username]/            # Public profile pages
│   ├── onboarding/            # New user setup
│   └── api/                   # API routes
├── components/
│   ├── ui/                    # Shadcn/ui components
│   └── magicui/               # Magic UI animated components
├── lib/
│   ├── supabase/              # Supabase client configuration
│   ├── db/                    # Database queries and helpers
│   └── utils.ts               # Utility functions
├── public/                    # Static assets
└── proxy.ts                   # Next.js 16 proxy (auth, rate limiting)
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nglfs/nglfs-frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Use https://nglfs.vercel.app for production
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Commands

```bash
# Development
pnpm dev          # Start dev server on http://localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Component Installation
npx shadcn-ui@latest add <component>     # Install Shadcn/ui component
npx magicui-cli@latest add <component>   # Install Magic UI component
```

## Design System

### Colors
- **Primary Gradient**: `#8B5CF6` (purple) → `#EC4899` (pink)
- **Secondary Gradient**: `#3B82F6` (blue) → `#06B6D4` (cyan)
- **Background**: `#0A0A0A` (almost black)
- **Surface**: `#1A1A1A`

### Design Principles
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur
- **Rounded Corners**: Consistent `rounded-2xl` (16px)
- **Dark Mode First**: Optimized for dark theme with light mode support
- **Mobile-First**: Responsive design starting from mobile breakpoints
- **Gradient Accents**: Purple-pink and blue-cyan gradients throughout

## Database Schema

### Core Tables
- **profiles** - User profiles with username, bio, avatar
- **messages** - Anonymous messages with recipient tracking
- **message_analytics** - Event tracking for analytics
- **link_visits** - Profile visit tracking
- **blocked_senders** - Abuse prevention

All tables use Row Level Security (RLS) policies for data protection.

## Security Features

- **IP Hashing**: All IP addresses stored as SHA-256 hashes
- **Rate Limiting**: Proxy-level protection against abuse
  - 3 anonymous messages per IP per hour
  - 100 API requests per user per minute
  - 5 login attempts per email per 15 minutes
- **Row Level Security**: Database-level access control
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: Content sanitization for user inputs

## Performance Targets

- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Lighthouse score > 90
- Optimized images with `next/image`
- Code splitting by route (automatic with App Router)
- Lazy loading for heavy components

## Component Libraries

### Shadcn/ui
Use for form elements and interactive components:
- Forms, inputs, buttons, dialogs, dropdowns
- Installed via CLI and customizable in `components/ui/`

### Magic UI
Use for visual effects and animations:
- Animated backgrounds (Particles, Retro Grid)
- Interactive cards (Magic Card, Neon Gradient Card)
- Text animations (Animated Gradient Text, Morphing Text)
- Celebration effects (Confetti, Cool Mode)

## Next.js 16 Specifics

### Server vs Client Components
- **Default**: Server Components (better performance)
- **Use `"use client"`** for:
  - Event handlers (onClick, onChange)
  - React hooks (useState, useEffect)
  - Browser APIs (localStorage, window)
  - Third-party client-only libraries

### Proxy (formerly Middleware)
Next.js 16 renamed `middleware.ts` to `proxy.ts`:
- Handles authentication and session refresh
- Protects routes (/dashboard, /onboarding, /settings)
- Implements rate limiting
- Runs on Node.js runtime (default)

## Documentation

- **PRD.md** - Complete product requirements and design system
- **PLANNING.md** - 4-week sprint plan with daily tasks
- **TASKS.md** - Detailed task list with checkboxes
- **CLAUDE.md** - AI assistance guide and architecture reference
- **AUTH_CONFIGURATION_GUIDE.md** - Supabase authentication setup

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Magic UI Documentation](https://magicui.design/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy automatically on push

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://nglfs.vercel.app
```

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Current Status

**Phase**: Foundation & Infrastructure (Week 1)

**Completed**:
- Next.js 16 + React 19 setup
- Tailwind CSS v4 configuration
- Shadcn/ui base components
- Dark mode with next-themes
- Project structure established
- Authentication proxy (proxy.ts)

**Next Priority**:
- Magic UI installation and integration
- Supabase database schema implementation
- Authentication pages with Magic UI styling
- Profile page development
- Anonymous message submission flow

## License

[Add your license here]

## Contributing

[Add contributing guidelines here]
