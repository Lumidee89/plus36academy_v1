// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plus36 Academy — Learn. Grow. Earn.',
  description: 'Join thousands of learners mastering in-demand skills at Plus36 Academy. World-class courses, expert tutors, and a community that accelerates your growth.',
  keywords: ['online learning', 'courses', 'education', 'skills', 'Nigeria', 'Africa'],
  openGraph: {
    title: 'Plus36 Academy',
    description: 'Learn from expert tutors and accelerate your career growth.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
