import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { evaluateGating } from '@/domain/gating/evaluate';

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name cannot be empty'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        gatingRuns: {
          orderBy: { createdAt: 'desc' },
          include: {
            answers: {
              include: {
                question: true,
              },
              orderBy: {
                question: {
                  order: 'asc',
                },
              },
            },
          },
        },
        scorecardRuns: {
          orderBy: { createdAt: 'desc' },
          include: {
            scores: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { ok: false, error: { message: 'Project not found' } },
        { status: 404 }
      );
    }

    // Evaluate gating status if there's a gating run
    let gatingStatus: 'not_started' | 'passed' | 'failed' = 'not_started';
    if (project.gatingRuns.length > 0) {
      const latestGatingRun = project.gatingRuns[0];
      const evaluation = evaluateGating(
        latestGatingRun.answers.map((a: { questionId: string; value: boolean }) => ({
          questionId: a.questionId,
          value: a.value,
        }))
      );
      gatingStatus = evaluation.shouldProceed ? 'passed' : 'failed';
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...project,
        gatingStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to fetch project' },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const validation = updateProjectSchema.safeParse(body);

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

    const { name } = validation.data;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name },
    });

    return NextResponse.json({
      ok: true,
      data: project,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to update project' },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({
      ok: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to delete project' },
      },
      { status: 500 }
    );
  }
}
