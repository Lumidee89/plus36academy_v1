// src/types/index.ts

export type Role = 'STUDENT' | 'TUTOR' | 'ADMIN'
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type MaterialType = 'PDF' | 'IMAGE' | 'TEXT' | 'VIDEO' | 'VIDEO_LINK'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  avatar?: string
  bio?: string
  phone?: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser extends User {
  token: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnail?: string
  price: number
  currency: string
  status: CourseStatus
  level: string
  duration?: string
  language: string
  requirements: string[]
  objectives: string[]
  tags: string[]
  isFreemium: boolean
  tutorId: string
  categoryId?: string
  tutor?: User
  category?: Category
  modules?: Module[]
  _count?: {
    enrollments: number
    reviews: number
  }
  avgRating?: number
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  title: string
  description?: string
  order: number
  courseId: string
  materials?: Material[]
  createdAt: string
}

export interface Material {
  id: string
  title: string
  description?: string
  type: MaterialType
  fileUrl?: string
  videoUrl?: string
  content?: string
  duration?: number
  fileSize?: number
  mimeType?: string
  order: number
  isFree: boolean
  moduleId: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: string
  progress: number
  completedAt?: string
  course?: Course
  user?: User
  createdAt: string
}

export interface Payment {
  id: string
  userId: string
  courseId: string
  amount: number
  currency: string
  status: PaymentStatus
  provider: string
  providerRef?: string
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  courseId: string
  rating: number
  comment?: string
  user?: User
  createdAt: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface DashboardStats {
  totalStudents?: number
  totalTutors?: number
  totalCourses?: number
  totalRevenue?: number
  enrollmentsToday?: number
  activeEnrollments?: number
  completedCourses?: number
  avgRating?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: Role
}
