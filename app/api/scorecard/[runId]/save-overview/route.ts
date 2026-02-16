import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const overviewSchema = z.object({
  pros: z.string().optional(),
  cons: z.string().optional(),
  summary: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const validation = overviewSchema.safeParse(body);

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

    const { pros, cons, summary } = validation.data;

    // Upsert overview (update if exists, create if not)
    const overview = await prisma.scorecardOverview.upsert({
      where: { runId },
      update: {
        pros: pros || null,
        cons: cons || null,
        summary: summary || null,
      },
      create: {
        runId,
        pros: pros || null,
        cons: cons || null,
        summary: summary || null,
      },
    });

    console.log('[Save Overview API] Successfully saved overview for runId:', runId);

    return NextResponse.json({
      ok: true,
      data: {
        overviewId: overview.id,
      },
    });
  } catch (error) {
    console.error('Error saving overview:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to save overview' },
      },
      { status: 500 }
    );
  }
}
