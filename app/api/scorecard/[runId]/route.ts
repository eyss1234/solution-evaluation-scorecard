import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updateScorecardSchema = z.object({
  name: z.string().min(1, 'Scorecard name cannot be empty'),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const body = await request.json();
    const validation = updateScorecardSchema.safeParse(body);

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

    const scorecardRun = await prisma.scorecardRun.update({
      where: { id: runId },
      data: { name },
    });

    return NextResponse.json({
      ok: true,
      data: scorecardRun,
    });
  } catch (error) {
    console.error('Error updating scorecard:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to update scorecard' },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;

    await prisma.scorecardRun.delete({
      where: { id: runId },
    });

    return NextResponse.json({
      ok: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting scorecard:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to delete scorecard' },
      },
      { status: 500 }
    );
  }
}
