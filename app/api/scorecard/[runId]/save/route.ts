import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const saveSchema = z.object({
  scores: z.array(
    z.object({
      questionId: z.string(),
      value: z.number().int().min(0).max(5),
    })
  ),
  stepComment: z.string().optional(),
  stepNumber: z.number().int().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const validation = saveSchema.safeParse(body);

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

    const scorecardRun = await prisma.scorecardRun.findUnique({
      where: { id: runId },
    });

    if (!scorecardRun) {
      return NextResponse.json(
        { ok: false, error: { message: 'Scorecard run not found' } },
        { status: 404 }
      );
    }

    const { scores, stepComment, stepNumber } = validation.data;

    console.log('[Save API] Saving scores for runId:', runId, 'scores:', scores);

    // Upsert scores (update if exists, create if not)
    const results = await Promise.all(
      scores.map((score) =>
        prisma.scorecardScore.upsert({
          where: {
            runId_questionId: {
              runId,
              questionId: score.questionId,
            },
          },
          update: {
            value: score.value,
          },
          create: {
            runId,
            questionId: score.questionId,
            value: score.value,
          },
        })
      )
    );

    // Save step comment if provided
    if (stepComment && stepNumber !== undefined) {
      await prisma.scorecardStepComment.upsert({
        where: {
          runId_stepNumber: {
            runId,
            stepNumber,
          },
        },
        update: {
          comment: stepComment,
        },
        create: {
          runId,
          stepNumber,
          comment: stepComment,
        },
      });
      console.log('[Save API] Saved step comment for step', stepNumber);
    }

    console.log('[Save API] Successfully saved', results.length, 'scores');

    return NextResponse.json({
      ok: true,
      data: {
        saved: scores.length,
      },
    });
  } catch (error) {
    console.error('Error saving scorecard progress:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to save scorecard progress' },
      },
      { status: 500 }
    );
  }
}
