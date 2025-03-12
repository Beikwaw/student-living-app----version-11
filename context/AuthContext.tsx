'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth';
import { clientAuth } from '../lib/firebase-client';
import { createUser } from '../lib/firestore';
import type { UserData, RequestDetails } from '../lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string, requestDetails?: Omit<RequestDetails, 'dateSubmitted'>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const handleAuthError = (error: any) => {
    console.error('Auth error:', error);
    if (error instanceof Error) {
      setError(error.message);
    } else if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        default:
          setError('An error occurred during authentication');
      }
    } else {
      setError('An unexpected error occurred');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create session');
          }
        } catch (error) {
          handleAuthError(error);
        }
      } else {
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to logout');
          }
        } catch (error) {
          handleAuthError(error);
        }
      }
      
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    name: string,
    requestDetails?: Omit<RequestDetails, 'dateSubmitted'>
  ) => {
    try {
      clearError();
      const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
      const { user } = userCredential;
      
      await createUser({
        id: user.uid,
        email: user.email!,
        name,
        role: 'user',
        requestDetails
      });

      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      clearError();
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      const { user } = userCredential;

      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      clearError();
      await signOut(clientAuth);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to logout');
      }
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 