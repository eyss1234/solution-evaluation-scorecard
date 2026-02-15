import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const createEntrySchema = z.object({
  name: z.string().min(1, 'Entry name cannot be empty'),
  category: z.enum(['IMPLEMENTATION_CAPEX', 'IMPLEMENTATION_OPEX', 'ONGOING_CAPEX', 'ONGOING_OPEX']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const validation = createEntrySchema.safeParse(body);

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

    const { name, category } = validation.data;

    const maxOrder = await prisma.financialEntry.findFirst({
      where: { projectId, category },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const order = (maxOrder?.order ?? -1) + 1;

    const entry = await prisma.financialEntry.create({
      data: {
        projectId,
        name,
        category,
        order,
      },
      include: {
        costs: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: entry,
    });
  } catch (error) {
    console.error('Error creating financial entry:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to create financial entry' },
      },
      { status: 500 }
    );
  }
}
