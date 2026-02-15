import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updateEntrySchema = z.object({
  name: z.string().min(1, 'Entry name cannot be empty'),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const body = await request.json();
    const validation = updateEntrySchema.safeParse(body);

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

    const entry = await prisma.financialEntry.update({
      where: { id: entryId },
      data: { name },
      include: {
        costs: true,
      },
    });

    return NextResponse.json({
      ok: true,
      data: entry,
    });
  } catch (error) {
    console.error('Error updating financial entry:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to update financial entry' },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; entryId: string }> }
) {
  try {
    const { entryId } = await params;

    await prisma.financialEntry.delete({
      where: { id: entryId },
    });

    return NextResponse.json({
      ok: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Error deleting financial entry:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to delete financial entry' },
      },
      { status: 500 }
    );
  }
}
