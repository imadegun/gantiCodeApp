import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db'
import { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AuthUser {
  id: string
  username: string
  email: string
  name?: string | null
  role: UserRole
  isActive: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  name?: string
  role: UserRole
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  const { username, password } = credentials

  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      password: true,
      role: true,
      isActive: true
    }
  })

  if (!user || !user.isActive) {
    return null
  }

  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    return null
  }

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  })

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive
  }
}

export async function createUser(userData: CreateUserData): Promise<AuthUser> {
  const hashedPassword = await hashPassword(userData.password)

  const user = await db.user.create({
    data: {
      ...userData,
      password: hashedPassword
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  })

  return user
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      isActive: true
    }
  })

  return user
}

// Role-based access control helpers
export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    'USER': 0,
    'PRODUCT_CODE_MANAGER': 1,
    'STOCK_MANAGER': 2,
    'ADMIN': 3
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export const canAccessStock = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'STOCK_MANAGER')
}

export const canAccessProductCode = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'PRODUCT_CODE_MANAGER')
}

export const canAccessAdmin = (userRole: UserRole): boolean => {
  return hasPermission(userRole, 'ADMIN')
}