import React from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../context/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MDO - Student Living App',
  description: 'MDO Student Living Application - Your one-stop platform for student accommodation and services',
  keywords: 'MDO, student living, accommodation, student services',
  openGraph: {
    title: 'MDO - Student Living App',
    description: 'MDO Student Living Application - Your one-stop platform for student accommodation and services',
    siteName: 'MDO',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
} 