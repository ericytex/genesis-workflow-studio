
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        owner: { clerkId: userId },
      },
      include: {
        executionLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, workflow })
  } catch (error) {
    console.error('Get workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, data } = await request.json()

    const workflow = await prisma.workflow.updateMany({
      where: {
        id: params.id,
        owner: { clerkId: userId },
      },
      data: {
        name,
        description,
        data,
        updatedAt: new Date(),
      },
    })

    if (workflow.count === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const updatedWorkflow = await prisma.workflow.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, workflow: updatedWorkflow })
  } catch (error) {
    console.error('Update workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const workflow = await prisma.workflow.deleteMany({
      where: {
        id: params.id,
        owner: { clerkId: userId },
      },
    })

    if (workflow.count === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
