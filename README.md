# Youth Camp Registration System

A modern, responsive web application for managing youth camp registrations with offline support.

## Features

- ✅ Participant Registration with automatic room & group assignment
- ✅ Room & Group Management
- ✅ Community Management
- ✅ Admin Dashboard with PIN protection
- ✅ Offline Support (localStorage + Firebase sync)
- ✅ Mobile Responsive
- ✅ Custom Participant ID Generation
- ✅ Filtering & Sorting
- ✅ Reported Status Tracking
- ✅ Export to CSV
- ✅ Total Registration Fee Tracking

## Tech Stack

- **Next.js 16** - React Framework
- **TypeScript** - Type Safety
- **Firebase Firestore** - Database
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI Components

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project set up
- npm or pnpm package manager

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd youth-camp-registration
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

4. Run the development server
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

**Want to host this for free?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to:
- Vercel (Recommended - Best for Next.js)
- Netlify
- Firebase Hosting
- Railway

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Deploy!

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── ui/               # UI components
│   ├── registration-form.tsx
│   ├── participants-list.tsx
│   └── welcome-screen.tsx
├── lib/                   # Utilities
│   ├── firebase/         # Firebase configuration
│   ├── storage.ts        # Storage abstraction
│   ├── types.ts          # TypeScript types
│   └── offline-storage.ts # Offline support
└── public/               # Static assets
```

## Features in Detail

### Participant Registration
- Quick registration form
- Automatic room assignment (gender-based)
- Automatic group assignment (random)
- Custom ID generation (Room Initial + Group Number + Random Digits)
- Shows assigned room, ID, and group after registration

### Admin Dashboard
- PIN protected (PIN: 1493)
- Manage rooms, communities, groups
- View participants by room/community/group
- Edit and delete participants
- Track reported status
- View total registration fees

### Offline Support
- Works without internet connection
- Automatic sync when online
- LocalStorage backup
- Queue system for offline operations

### Export Feature
- Export participant data to CSV
- Respects current filters and sorting
- Includes all participant information

## License

Developed by **Nasara TecHub**

## Support

For deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md)

