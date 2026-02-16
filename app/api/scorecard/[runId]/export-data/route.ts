import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    const scorecardRun = await prisma.scorecardRun.findUnique({
      where: { id: runId },
      include: {
        scores: {
          include: {
            question: true,
          },
          orderBy: [
            { question: { stepNumber: 'asc' } },
            { question: { order: 'asc' } },
          ],
        },
        stepComments: {
          orderBy: { stepNumber: 'asc' },
        },
        overview: true,
      },
    });

    if (!scorecardRun) {
      return NextResponse.json(
        { ok: false, error: { message: 'Scorecard run not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: scorecardRun,
    });
  } catch (error) {
    console.error('Error fetching scorecard export data:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to fetch scorecard data' },
      },
      { status: 500 }
    );
  }
}
