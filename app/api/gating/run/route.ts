import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { evaluateGating } from '@/domain/gating/evaluate';

const createRunSchema = z.object({
  projectId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      value: z.boolean(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createRunSchema.safeParse(body);

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

    const { projectId, answers } = validation.data;

    // Evaluate gating logic
    const evaluation = evaluateGating(answers);

    // Create run and answers in database
    const run = await prisma.gatingRun.create({
      data: {
        projectId,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        },
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        runId: run.id,
        shouldProceed: evaluation.shouldProceed,
        answeredYes: evaluation.answeredYes,
        totalQuestions: evaluation.totalQuestions,
      },
    });
  } catch (error) {
    console.error('Error creating gating run:', error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: 'Failed to create gating run',
        },
      },
      { status: 500 }
    );
  }
}
