
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { executeWorkflow } from '@/lib/workflow'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { triggerInput } = await request.json()

    // Verify workflow ownership
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: params.id,
        owner: { clerkId: userId },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Execute workflow
    const result = await executeWorkflow(params.id, user.id, triggerInput)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Execute workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
