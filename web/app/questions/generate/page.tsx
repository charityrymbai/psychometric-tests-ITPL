// This is the Questions Generation Page
// TODO: Use a dynamic route and fetch sectionId from the URL (e.g., /questions/generate?sectionId=...)
// TODO: Replace dummy data and fetch group/section info from API

'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash, Check, Pencil } from 'lucide-react';

// Dummy data for demonstration
type Question = {
  id: number;
  text: string;
  options: string[];
  correct: number;
};

const dummyQuestions: Question[] = [
  {
    id: 1,
    text: 'What is the capital of France?',
    options: ['Paris', 'London', 'Berlin', 'Madrid'],
    correct: 0,
  },
  {
    id: 2,
    text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correct: 1,
  },
];





export default function GenerateQuestionsPage() {
  // Use useSearchParams hook for Next.js App Router
  const searchParams = useSearchParams();
  const sectionId = searchParams.get('sectionId') || 'dummy-section-id';
  const groupName = 'Dummy Group'; // TODO: Fetch from API
  const sectionName = 'Dummy Section'; // TODO: Fetch from API

  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editing, setEditing] = useState<Record<number, boolean>>({}); // { [questionId]: boolean }

  // Simulate HTTP request to generate questions
  useEffect(() => {
    setLoading(true);
    // TODO: Replace with real API call using sectionId
    setTimeout(() => {
      setQuestions(dummyQuestions);
      setEditing(dummyQuestions.reduce((acc, q) => ({ ...acc, [q.id]: true }), {}));
      setLoading(false);
    }, 1000);
  }, [sectionId]);

  const handleDelete = (id: number) => {
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const handleApprove = (id: number) => {
    setEditing((ed) => ({ ...ed, [id]: false }));
  };

  const handleEdit = (id: number) => {
    setEditing((ed) => ({ ...ed, [id]: true }));
  };

  const handleQuestionChange = (id: number, value: string) => {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, text: value } : q))
    );
  };

  const handleOptionChange = (qid: number, idx: number, value: string) => {
    setQuestions((qs) =>
      qs.map((q) =>
        q.id === qid
          ? { ...q, options: q.options.map((opt, i) => (i === idx ? value : opt)) }
          : q
      )
    );
  };

  const handleCorrectChange = (qid: number, idx: number) => {
    setQuestions((qs) =>
      qs.map((q) => (q.id === qid ? { ...q, correct: idx } : q))
    );
  };

  if (loading) return <div className="p-8">Generating questions...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto mb-32">
      {/* Top bar with group and section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="text-lg font-bold">Group: {groupName}</div>
          <div className="text-md text-gray-600">Section: {sectionName} (ID: {sectionId})</div>
        </div>
        {/* TODO: Use Next.js route for navigation */}
      </div>

      {/* Questions List */}
      <div className="space-y-8">
        {questions.map((q) => (
          <div key={q.id} className="border rounded-lg p-4 relative bg-white shadow">
            {/* Top right buttons */}
            <div className="absolute right-4 top-4 flex gap-2 z-10">
              <Button variant="destructive" size="icon" onClick={() => handleDelete(q.id)} title="Delete">
                <Trash className="w-4 h-4" />
              </Button>
              {editing[q.id] ? (
                <Button size="icon" onClick={() => handleApprove(q.id)} title="Approve">
                  <Check className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="icon" variant="outline" onClick={() => handleEdit(q.id)} title="Edit">
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>
            {/* Add space below the icon buttons for separation */}
            <div className="h-8" />
            {/* Question text */}
            <div className="mb-4 mt-2">
              <label className="block font-semibold mb-1">Question:</label>
              <Input
                value={q.text}
                disabled={!editing[q.id]}
                onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                className="w-full"
              />
            </div>
            {/* Options */}
            <div>
              <label className="block font-semibold mb-1">Options:</label>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.correct === idx}
                      disabled={!editing[q.id]}
                      onChange={() => handleCorrectChange(q.id, idx)}
                      className="accent-blue-600"
                    />
                    <Input
                      value={opt}
                      disabled={!editing[q.id]}
                      onChange={(e) => handleOptionChange(q.id, idx, e.target.value)}
                      className={
                        'w-full ' +
                        (q.correct === idx ? 'border-2 border-blue-500 bg-blue-50' : '')
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Fixed Save Button at the bottom */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center gap-4 bg-white border-t py-4 z-20">
        <Button
          variant="outline"
          className="px-8 py-2 text-lg font-semibold"
          onClick={() => {
            // TODO: Update this route if your section details page uses a different path
            window.location.href = `/settings?sectionId=${sectionId}`;
          }}
        >
          Cancel
        </Button>
        <Button className="px-8 py-2 text-lg font-semibold" onClick={() => {/* TODO: Implement save logic */}}>
          Save
        </Button>
      </div>
    </div>
  );
}
