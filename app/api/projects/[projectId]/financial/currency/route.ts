import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const updateCurrencySchema = z.object({
  currency: z.enum(['GBP', 'USD', 'EUR']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const validation = updateCurrencySchema.safeParse(body);

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

    const { currency } = validation.data;

    const settings = await prisma.projectFinancialSettings.upsert({
      where: { projectId },
      update: { currency },
      create: {
        projectId,
        currency,
      },
    });

    return NextResponse.json({
      ok: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error updating currency settings:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to update currency settings' },
      },
      { status: 500 }
    );
  }
}
