import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const createScorecardSchema = z.object({
  projectId: z.string(),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createScorecardSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message: 'Invalid request body',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { projectId, name } = validation.data;

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { ok: false, error: { message: 'Project not found' } },
        { status: 404 }
      );
    }

    // Create new scorecard run
    const scorecardRun = await prisma.scorecardRun.create({
      data: {
        projectId,
        name,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        scorecardRunId: scorecardRun.id,
      },
    });
  } catch (error) {
    console.error('Error creating scorecard run:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to create scorecard run' },
      },
      { status: 500 }
    );
  }
}
