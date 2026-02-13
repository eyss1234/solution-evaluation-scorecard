'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { Card } from './Card';

interface GateQuestion {
  id: string;
  text: string;
  order: number;
}

interface GatingFormProps {
  questions: GateQuestion[];
}

export function GatingForm({ questions }: GatingFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswerChange = (questionId: string, value: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all questions are answered
    const allAnswered = questions.every((q) => answers[q.id] !== undefined);
    if (!allAnswered) {
      setError('Please answer all questions before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/gating/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: questions.map((q) => ({
            questionId: q.id,
            value: answers[q.id],
          })),
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to submit answers');
      }

      // Redirect based on evaluation
      if (data.data.shouldProceed) {
        router.push(`/scorecard/${data.data.runId}/step/1`);
      } else {
        router.push(`/stop/${data.data.runId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Progress indicator */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700">Progress</span>
          <span className="text-sm font-semibold text-indigo-600">
            {answeredCount} / {questions.length}
          </span>
        </div>
        <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-semibold flex items-center justify-center text-sm">
                {index + 1}
              </span>
              <h3 className="text-xl font-medium text-zinc-900 leading-relaxed flex-1">
                {question.text}
              </h3>
            </div>
            <div className="flex gap-3 ml-11">
              <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                answers[question.id] === true
                  ? 'border-green-300 bg-green-50 text-green-700 shadow-sm'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
              }`}>
                <input
                  type="radio"
                  name={question.id}
                  value="true"
                  checked={answers[question.id] === true}
                  onChange={() => handleAnswerChange(question.id, true)}
                  className="sr-only"
                />
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Yes</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                answers[question.id] === false
                  ? 'border-red-200 bg-red-50 text-red-600 shadow-sm'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
              }`}>
                <input
                  type="radio"
                  name={question.id}
                  value="false"
                  checked={answers[question.id] === false}
                  onChange={() => handleAnswerChange(question.id, false)}
                  className="sr-only"
                />
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">No</span>
              </label>
            </div>
          </div>
        </Card>
      ))}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-4">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Evaluation'
        )}
      </Button>
    </form>
  );
}
