import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserById, verifyToken, canAccessAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { UserRole } from '@prisma/client'

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  role: z.nativeEnum(UserRole)
})

// GET /api/auth/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication and authorization
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const user = await getUserById(decoded.id)
    if (!user || !canAccessAdmin(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get all users
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: users
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/auth/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Verify authentication and authorization
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      )
    }

    const currentUser = await getUserById(decoded.id)
    if (!currentUser || !canAccessAdmin(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Validate input
    const body = await request.json()
    const validation = createUserSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.issues
        },
        { status: 400 }
      )
    }

    // Check if username or email already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username: validation.data.username },
          { email: validation.data.email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    // Create user
    const newUser = await createUser(validation.data)

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}