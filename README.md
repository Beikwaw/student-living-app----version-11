# MDO - Student Living App

A Next.js application for managing student accommodation and services, built with Firebase Authentication and Firestore.

## Features

- User authentication (students and administrators)
- Student application submission and tracking
- Real-time communication between students and administrators
- Admin dashboard for managing applications
- Secure data access with Firestore security rules
- Server-side authentication and authorization

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Firebase Authentication
- Firebase Admin SDK
- Cloud Firestore
- Tailwind CSS

## Prerequisites

- Node.js 16.8 or later
- Firebase project with Authentication and Firestore enabled
- Firebase Admin SDK credentials
- npm or yarn package manager

## Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/mdo-student-living.git
cd mdo-student-living
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up Firebase:
   - Go to the [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication with Email/Password
   - Enable Cloud Firestore
   - Get your Firebase configuration
   - Generate a new private key for the Admin SDK:
     1. Go to Project Settings > Service Accounts
     2. Click "Generate New Private Key"
     3. Save the JSON file securely

4. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your configuration values:
- Add your Firebase client configuration (public variables)
- Add your Firebase Admin SDK configuration (private variables)
- Set your application URL

5. Deploy Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

6. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

### Public Variables (Client-side)
These variables are exposed to the browser and are used for client-side Firebase operations:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Private Variables (Server-side)
These variables are kept secure and are only used server-side:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── student/           # Student dashboard
│   └── layout.tsx         # Root layout
├── context/               # React context providers
├── lib/                   # Shared utilities
│   ├── firebase.ts        # Firebase initialization
│   └── firestore.ts       # Firestore operations
├── public/                # Static files
└── middleware.ts          # Route protection middleware
```

## Authentication

The application uses Firebase Authentication for user management with server-side verification:
- Client-side Firebase SDK for user authentication
- Firebase Admin SDK for server-side verification
- Session cookies for secure authentication state
- Two types of users are supported:
  - Students (role: 'user')
  - Administrators (role: 'admin')

## Database Structure

Firestore collections:
- `users`: User profiles and application data
  - `id`: User ID (matches Firebase Auth UID)
  - `email`: User's email
  - `name`: User's name
  - `role`: User role ('user' or 'admin')
  - `applicationStatus`: Application status ('pending', 'accepted', or 'denied')
  - `requestDetails`: Accommodation request information
  - `communicationLog`: Messages between user and admin

## Security

- Firebase Authentication for user management
- Firebase Admin SDK for server-side verification
- Firestore security rules for data protection
- Route protection with Next.js middleware
- Environment variables for sensitive configuration
- Session cookies for secure authentication state

## Deployment

When deploying to Vercel:
1. Add all environment variables in the Vercel project settings
2. Make sure to properly format the `FIREBASE_PRIVATE_KEY` (replace newlines with \n)
3. Enable Edge Functions if using middleware
4. Set up proper CORS and CSP headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 