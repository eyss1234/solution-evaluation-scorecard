'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScorecard } from '@/contexts/ScorecardContext';

export function ScorecardOverviewForm() {
  const router = useRouter();
  const { overview, setOverview, runId } = useScorecard();
  const [pros, setPros] = useState(overview.pros || '');
  const [cons, setCons] = useState(overview.cons || '');
  const [summary, setSummary] = useState(overview.summary || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState<'pros' | 'cons' | 'summary' | null>(null);

  useEffect(() => {
    setPros(overview.pros || '');
    setCons(overview.cons || '');
    setSummary(overview.summary || '');
  }, [overview]);

  const handleGenerate = async (type: 'pros' | 'cons' | 'summary') => {
    setIsGenerating(type);
    try {
      const response = await fetch(`/api/scorecard/${runId}/generate-overview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();
      if (data.ok) {
        const generatedText = data.data.text;
        if (type === 'pros') {
          setPros(generatedText);
        } else if (type === 'cons') {
          setCons(generatedText);
        } else {
          setSummary(generatedText);
        }
      } else {
        console.error('Failed to generate:', data.error);
        alert(`Failed to generate ${type}. Please try again.`);
      }
    } catch (error) {
      console.error('Error generating:', error);
      alert(`Error generating ${type}. Please try again.`);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleNext = async () => {
    setIsSaving(true);
    try {
      // Save overview data
      const overviewData = {
        pros: pros.trim() || undefined,
        cons: cons.trim() || undefined,
        summary: summary.trim() || undefined,
      };

      const response = await fetch(`/api/scorecard/${runId}/save-overview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overviewData),
      });

      const data = await response.json();
      if (!data.ok) {
        console.error('Failed to save overview:', data.error);
      } else {
        console.log('Successfully saved overview');
        setOverview(overviewData);
      }
    } catch (error) {
      console.error('Error saving overview:', error);
    } finally {
      setIsSaving(false);
    }

    // Navigate to review
    router.push(`/scorecard/${runId}/review`);
  };

  const handleBack = () => {
    router.push(`/scorecard/${runId}/step/6`);
  };

  return (
    <div className="space-y-8">
      {/* Step header */}
      <div>
        <p className="text-sm uppercase tracking-wide text-zinc-500 font-medium mb-2">
          Step 7 of 7
        </p>
        <h1 className="text-2xl font-bold text-zinc-900">Overview</h1>
        <p className="text-zinc-500 mt-1">Optional summary of pros, cons, and overall assessment</p>
      </div>

      {/* Pros Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-zinc-900">Pros</h3>
          <button
            type="button"
            onClick={() => handleGenerate('pros')}
            disabled={isGenerating !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating === 'pros' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        </div>
        <textarea
          value={pros}
          onChange={(e) => setPros(e.target.value)}
          placeholder="List the key strengths and advantages of this solution..."
          rows={6}
          className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Cons Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-zinc-900">Cons</h3>
          <button
            type="button"
            onClick={() => handleGenerate('cons')}
            disabled={isGenerating !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating === 'cons' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        </div>
        <textarea
          value={cons}
          onChange={(e) => setCons(e.target.value)}
          placeholder="List the key weaknesses and challenges of this solution..."
          rows={6}
          className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-zinc-900">Summary</h3>
          <button
            type="button"
            onClick={() => handleGenerate('summary')}
            disabled={isGenerating !== null}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating === 'summary' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Provide an overall assessment and recommendation..."
          rows={6}
          className="w-full px-4 py-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-3 rounded-xl font-semibold text-zinc-600 border-2 border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-200 shadow-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Review Scores'}
        </button>
      </div>
    </div>
  );
}
