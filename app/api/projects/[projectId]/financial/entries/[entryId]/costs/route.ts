import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

const updateCostsSchema = z.object({
  costs: z.record(z.string(), z.number().min(0)),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const body = await request.json();
    const validation = updateCostsSchema.safeParse(body);

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

    const { costs } = validation.data;

    const operations = Object.entries(costs).map(([scorecardRunId, amount]) => {
      return prisma.financialCost.upsert({
        where: {
          entryId_scorecardRunId: {
            entryId,
            scorecardRunId,
          },
        },
        update: {
          amount: new Prisma.Decimal(amount),
        },
        create: {
          entryId,
          scorecardRunId,
          amount: new Prisma.Decimal(amount),
        },
      });
    });

    await prisma.$transaction(operations);

    const updatedEntry = await prisma.financialEntry.findUnique({
      where: { id: entryId },
      include: {
        costs: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: updatedEntry,
    });
  } catch (error) {
    console.error('Error updating financial costs:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to update financial costs' },
      },
      { status: 500 }
    );
  }
}
