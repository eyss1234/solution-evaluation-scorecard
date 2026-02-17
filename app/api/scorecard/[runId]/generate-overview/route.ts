import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { STEPS } from '@/lib/steps';

const generateSchema = z.object({
  type: z.enum(['pros', 'cons', 'summary']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    console.log('[Generate Overview] Starting request');
    const { runId } = await params;
    console.log('[Generate Overview] RunId:', runId);
    
    const body = await request.json();
    console.log('[Generate Overview] Request body:', body);
    
    const validation = generateSchema.safeParse(body);

    if (!validation.success) {
      console.error('[Generate Overview] Validation failed:', validation.error);
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

    const { type } = validation.data;
    console.log('[Generate Overview] Type:', type);

    // Fetch scorecard data
    console.log('[Generate Overview] Fetching scorecard run from database');
    console.log('[Generate Overview] Database URL configured:', !!process.env.DATABASE_URL);
    
    let scorecardRun;
    try {
      scorecardRun = await prisma.scorecardRun.findUnique({
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
        },
      });
      console.log('[Generate Overview] Database query completed, result:', !!scorecardRun);
    } catch (dbError) {
      console.error('[Generate Overview] Database error:', dbError);
      return NextResponse.json(
        { 
          ok: false, 
          error: { 
            message: 'Database connection error',
            details: dbError instanceof Error ? dbError.message : 'Unknown error'
          } 
        },
        { status: 500 }
      );
    }

    if (!scorecardRun) {
      console.error('[Generate Overview] Scorecard run not found:', runId);
      console.log('[Generate Overview] Checking if any scorecard runs exist...');
      try {
        const count = await prisma.scorecardRun.count();
        console.log('[Generate Overview] Total scorecard runs in database:', count);
      } catch (e) {
        console.error('[Generate Overview] Could not count runs:', e);
      }
      return NextResponse.json(
        { ok: false, error: { message: 'Scorecard run not found' } },
        { status: 404 }
      );
    }
    
    console.log('[Generate Overview] Found scorecard run with', scorecardRun.scores.length, 'scores');

    // Prepare data for AI
    const scorecardData = STEPS.filter(step => step.questionsPerStep > 0).map((step) => {
      const stepScores = scorecardRun.scores.filter(
        (s) => s.question.stepNumber === step.number
      );
      return {
        stepName: step.name,
        sectionWeight: step.sectionWeight,
        questions: stepScores.map((s) => ({
          question: s.question.text,
          score: s.value,
          weight: s.question.weight,
        })),
      };
    });

    // Generate AI prompt based on type
    let prompt = '';
    if (type === 'pros') {
      prompt = `Based on the following solution evaluation scorecard data, generate a concise list of key strengths and advantages (pros) of this solution. Focus on areas with high scores and positive indicators.

Scorecard Data:
${JSON.stringify(scorecardData, null, 2)}

Generate a bullet-point list of 3-5 key pros. Be specific and reference the evaluation criteria.`;
    } else if (type === 'cons') {
      prompt = `Based on the following solution evaluation scorecard data, generate a concise list of key weaknesses and challenges (cons) of this solution. Focus on areas with low scores and concerns.

Scorecard Data:
${JSON.stringify(scorecardData, null, 2)}

Generate a bullet-point list of 3-5 key cons. Be specific and reference the evaluation criteria.`;
    } else {
      prompt = `Based on the following solution evaluation scorecard data, generate a concise overall summary and recommendation for this solution. Consider all aspects of the evaluation.

Scorecard Data:
${JSON.stringify(scorecardData, null, 2)}

Generate a 2-3 paragraph summary that includes:
1. Overall assessment of the solution
2. Key considerations for decision-makers
3. A clear recommendation (proceed, proceed with caution, or do not proceed)`;
    }

    // Call OpenAI API
    console.log('[Generate Overview] Checking for OpenAI API key');
    const openaiApiKey = process.env.OPEN_AI_KEY;
    console.log('[Generate Overview] API key exists:', !!openaiApiKey);
    
    if (!openaiApiKey) {
      console.error('[Generate Overview] OpenAI API key not configured');
      return NextResponse.json(
        {
          ok: false,
          error: { message: 'OpenAI API key not configured' },
        },
        { status: 500 }
      );
    }

    console.log('[Generate Overview] Calling OpenAI API with model: gpt-4o-mini');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes solution evaluation scorecards and provides clear, actionable insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('[Generate Overview] OpenAI response status:', openaiResponse.status);
    
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('[Generate Overview] OpenAI API error:', errorData);
      return NextResponse.json(
        {
          ok: false,
          error: { message: 'Failed to generate content from AI', details: errorData },
        },
        { status: 500 }
      );
    }

    const openaiData = await openaiResponse.json();
    const generatedText = openaiData.choices[0]?.message?.content || '';

    console.log(`[Generate Overview] Successfully generated ${type} for runId:`, runId);

    return NextResponse.json({
      ok: true,
      data: {
        text: generatedText,
        type,
      },
    });
  } catch (error) {
    console.error('Error generating overview:', error);
    return NextResponse.json(
      {
        ok: false,
        error: { message: 'Failed to generate overview' },
      },
      { status: 500 }
    );
  }
}
