import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear the session cookie
    const response = NextResponse.json({ 
      status: 'success',
      message: 'Logged out successfully'
    });
    
    response.cookies.set('session', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
} 