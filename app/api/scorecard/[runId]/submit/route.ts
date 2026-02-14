import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const submitSchema = z.object({
  scores: z.array(
    z.object({
      questionId: z.string(),
      value: z.number().int().min(0).max(5),
    })
  ),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const validation = submitSchema.safeParse(body);

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

    // Verify scorecard run exists
    const scorecardRun = await prisma.scorecardRun.findUnique({
      where: { id: runId },
    });

    if (!scorecardRun) {
      return NextResponse.json(
        { ok: false, error: { message: 'Scorecard run not found' } },
        { status: 404 }
      );
    }

    const { scores } = validation.data;

    // Update scorecard run with scores
    const updatedRun = await prisma.scorecardRun.update({
      where: { id: runId },
      data: {
        scores: {
          deleteMany: {},
          create: scores.map((s) => ({
            questionId: s.questionId,
            value: s.value,
          })),
        },
      },
      include: {
        scores: {
          include: {
            question: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        scorecardRunId: updatedRun.id,
        totalScores: updatedRun.scores.length,
      },
    });
  } catch (error) {
    console.error('Error submitting scorecard:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to submit scorecard' },
      },
      { status: 500 }
    );
  }
}
