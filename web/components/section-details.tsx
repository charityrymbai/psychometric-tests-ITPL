import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";
import { SectionForm, Section } from "./section-form";

interface SectionDetailsProps {
  section: {
    id: string;
    name: string;
    description?: string;
    questions?: any[] | number;
  };
  onClose: () => void;
  open: boolean;
}

const SectionDetails: React.FC<SectionDetailsProps> = ({ section, onClose, open }) => {
  const [questions, setQuestions] = useState<any[]>(Array.isArray(section.questions) ? section.questions : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState<any | null>(null);
  const [editState, setEditState] = useState<any | null>(null);
  // Section edit modal state
  const [editSectionOpen, setEditSectionOpen] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3002/questions/${section.id}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !section.id) return;
    fetchQuestions();
  }, [section.id, open]);

  if (!open) return null;

  return (
    <div className="w-full h-screen bg-background p-0 relative overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-8 border-b bg-white">
        <h2 className="text-3xl font-bold">Section Details</h2>
        <Button variant="outline" onClick={onClose} className="text-base px-6 py-2">Close</Button>
      </div>

      {/* Section Card */}
      <div className="p-10">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex-1">{section.name}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-gray-500 hover:text-black"
              title="Edit Section"
              onClick={() => setEditSectionOpen(true)}
            >
              <Pencil className="w-5 h-5" />
            </Button>
      {/* Edit Section Modal using SectionForm */}
      {editSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <SectionForm
            open={editSectionOpen}
            onClose={() => setEditSectionOpen(false)}
            initialData={{ id: section.id, name: section.name, description: section.description }}
            onSubmit={async (updatedSection: Section) => {
              const myHeaders = new Headers();
              myHeaders.append("Content-Type", "application/json");
              const raw = JSON.stringify({
                name: updatedSection.name,
                description: updatedSection.description
              });
              try {
                const res = await fetch(`http://localhost:3002/sections/${section.id}`, {
                  method: "PUT",
                  headers: myHeaders,
                  body: raw
                });
                if (!res.ok) throw new Error('Failed to update section');
                // Update UI immediately
                section.name = updatedSection.name;
                section.description = updatedSection.description;
                setEditSectionOpen(false);
              } catch (err) {
                console.error(err);
                alert("Failed to update section.");
              }
            }}
          />
        </div>
      )}
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="font-semibold">Description:</span> {section.description || "No description"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Questions:</span> {questions.length}
            </div>
          </CardContent>
        </Card>

        {/* Questions Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Questions</h3>
          {/* Generate button navigates to the questions generate page with sectionId */}
          <Button
            className="ml-4"
            variant="default"
            onClick={() => {
              // TODO: If using app router, use useRouter from 'next/navigation' instead
              window.location.href = `/questions/generate?sectionId=${section.id}`;
            }}
          >
            Generate
          </Button>
        </div>

        {/* Loading / Error / Questions Grid */}
        {loading && <div className="text-muted-foreground mb-4">Loading questions...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!loading && !error && questions.length > 0 && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {questions.map((q: any, idx: number) => (
              <Card key={q.id || idx} className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-black flex-1">
                    {q.text || q.questionText || `Question ${idx + 1}`}
                  </CardTitle>
                  <button
                    className="ml-4 p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-black transition"
                    title="Edit Question"
                    onClick={() => {
                      setEditQuestion(q);
                      setEditState({
                        text: q.text || q.questionText || '',
                        options: q.options ? q.options.map((opt: any) =>
                          typeof opt === 'object' && opt !== null ? (opt.text ?? JSON.stringify(opt)) : String(opt)
                        ) : [],
                        correct_option: q.correct_option
                      });
                    }}
                    type="button"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent>
                  {q.options && Array.isArray(q.options) && (
                    <ul className="list-none ml-0 mt-2">
                      {q.options.map((opt: any, i: number) => (
                        <li key={i} className={`flex items-center gap-2 px-3 py-2 rounded mb-1 ${q.correct_option === i ? 'bg-green-100 border border-green-400 text-black font-bold' : 'bg-gray-50 border border-gray-200 text-black'}`}>
                          <span className="inline-block w-6 h-6 text-center font-bold rounded-full bg-white border mr-2">{String.fromCharCode(65 + i)}</span>
                          <span>{typeof opt === 'object' && opt !== null ? opt.text ?? JSON.stringify(opt) : String(opt)}</span>
                          {q.correct_option === i && (
                            <span className="ml-2 px-2 py-1 rounded bg-green-400 text-white text-xs font-semibold">Correct</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Questions */}
        {!loading && !error && questions.length === 0 && (
          <div className="text-muted-foreground">No questions found for this section.</div>
        )}
      </div>

      {/* Edit Modal */}
      {editQuestion && editState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black p-2 rounded hover:bg-gray-100"
              onClick={() => { setEditQuestion(null); setEditState(null); }}
              title="Close"
              style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Question</h2>
            <div className="mb-4">
              <span className="font-semibold">Question:</span>
              <input
                className="mt-2 p-2 border rounded bg-gray-50 w-full text-base"
                value={editState.text}
                onChange={e => setEditState((prev: any) => ({ ...prev, text: e.target.value }))}
              />
            </div>
            {Array.isArray(editState.options) && (
              <div className="mb-4">
                <span className="font-semibold">Options:</span>
                <ul className="mt-2">
                  {editState.options.map((opt: string, i: number) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 px-3 py-2 rounded mb-1 text-black relative ${editState.correct_option === i ? 'border-2 border-black font-bold' : 'border border-gray-300'} bg-white ${editState.correct_option === i ? 'z-10' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setEditState((prev: any) => ({ ...prev, correct_option: i }))}
                    >
                      <span className="inline-block w-6 h-6 text-center font-bold rounded-full bg-gray-100 border mr-2">{String.fromCharCode(65 + i)}</span>
                      <input
                        className="flex-1 bg-transparent border-none outline-none text-base"
                        value={opt}
                        onChange={e => {
                          const newOptions = [...editState.options];
                          newOptions[i] = e.target.value;
                          setEditState((prev: any) => ({ ...prev, options: newOptions }));
                        }}
                      />
                      {editState.correct_option === i && (
                        <span className="ml-2 px-2 py-1 rounded bg-green-500 text-white text-xs font-semibold border border-green-500">Correct</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 text-white font-semibold"
                onClick={async () => {
                  if (!editQuestion || !editState) return;
                  const myHeaders = new Headers();
                  myHeaders.append("Content-Type", "application/json");
                  const raw = JSON.stringify({
                    text: editState.text,
                    questionText: editState.text,
                    options: editState.options.map((text: string) => ({ text })),
                    correct_option: editState.correct_option
                  });
                  try {
                    const res = await fetch(`http://localhost:3002/questions/${editQuestion.id}`, {
                      method: "PUT",
                      headers: myHeaders,
                      body: raw
                    });
                    if (!res.ok) throw new Error('Failed to update question');
                    const updated = await res.json();
                    setEditQuestion(null);
                    setEditState(null);
                    await fetchQuestions();
                  } catch (err) {
                    console.error(err);
                    alert("Failed to update question.");
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionDetails;
