import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const questions = await prisma.gateQuestion.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        questions,
      },
    });
  } catch (error) {
    console.error('Error fetching gate questions:', error);
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: 'Failed to fetch gate questions',
        },
      },
      { status: 500 }
    );
  }
}
