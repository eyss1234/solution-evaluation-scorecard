import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
});

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        gatingRuns: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            answers: true,
          },
        },
        scorecardRuns: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to fetch projects' },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createProjectSchema.safeParse(body);

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

    const project = await prisma.project.create({
      data: { name },
    });

    return NextResponse.json({
      ok: true,
      data: project,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to create project' },
      },
      { status: 500 }
    );
  }
}
