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
      setError('Please answer all questions');
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
        router.push(`/scorecard/${data.data.runId}`);
      } else {
        router.push(`/stop/${data.data.runId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <Card key={question.id}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {question.text}
            </h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value="true"
                  checked={answers[question.id] === true}
                  onChange={() => handleAnswerChange(question.id, true)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value="false"
                  checked={answers[question.id] === false}
                  onChange={() => handleAnswerChange(question.id, false)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">No</span>
              </label>
            </div>
          </div>
        </Card>
      ))}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
