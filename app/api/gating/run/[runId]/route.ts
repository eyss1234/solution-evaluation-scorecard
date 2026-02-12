import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    const run = await prisma.gatingRun.findUnique({
      where: { id: runId },
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
    });

    if (!run) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message: 'Run not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        run: {
          id: run.id,
          createdAt: run.createdAt,
          answers: run.answers.map((a) => ({
            questionId: a.questionId,
            questionText: a.question.text,
            value: a.value,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching gating run:', error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: 'Failed to fetch gating run',
        },
      },
      { status: 500 }
    );
  }
}
