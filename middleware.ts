import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth, adminDb } from './lib/firebase-admin';

export async function middleware(request: NextRequest) {
  // Get the current path
  const path = request.nextUrl.pathname;

  // Check if it's an admin route
  if (path.startsWith('/admin')) {
    try {
      // Get the session cookie
      const sessionCookie = request.cookies.get('session')?.value;

      if (!sessionCookie) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Verify the session cookie
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      
      // Get user data from Firestore
      const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
      const userData = userDoc.data();

      // Check if user is an admin
      if (!userData || userData.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // If there's any error, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
}; 