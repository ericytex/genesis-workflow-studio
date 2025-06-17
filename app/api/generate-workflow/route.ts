
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { generateWorkflow } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await request.json()
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Generate workflow using OpenAI
    const result = await generateWorkflow(prompt)
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Update user's token usage
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        tokensUsed: {
          increment: result.tokensUsed,
        },
      },
    })

    return NextResponse.json({
      success: true,
      workflow: result.workflow,
      tokensUsed: result.tokensUsed,
    })
  } catch (error) {
    console.error('Generate workflow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
