import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SectionForm, Section } from "./section-form";
import { Switch } from "./ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";

// Local type definitions - will be replaced with shared types once import is resolved
interface QuestionOption {
  text: string;
  tag_id: number | null;
  tag_name_display?: string; // For displaying tag name directly from AI
  isCorrect?: boolean;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correct_option?: number | null;
  type: 'single_choice' | 'multiple_choice' | 'tag_based';
}

interface SectionDetailProps {
  section: Section & {
    groupId?: string;
    tags?: any[];
  };
  onClose: () => void;
  open: boolean;
}

type OptionType = QuestionOption;

const SectionDetails: React.FC<SectionDetailProps> = ({ section, onClose, open }) => {
  const [sectionDetails, setSectionDetails] = useState({
    id: section.id,
    name: section.name,
    description: section.description,
    isSingleOptionCorrect: section.isSingleOptionCorrect,
    groupId: (section as any).groupId,
    tags: (section as any).tags || [],
  });
  const [questions, setQuestions] = useState<any[]>(Array.isArray(section.questions) ? section.questions : []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState<any | null>(null);
  const [editState, setEditState] = useState<{
    text: string;
    options: OptionType[];
    correct_option: number | null;
  } | null>(null);
  // Section edit modal state
  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [isSingleOptionCorrect, setIsSingleOptionCorrect] = useState(!!section.isSingleOptionCorrect);

  // Add Question modal state
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  type OptionType = { text: string; tag_id: number | null; tag_name_display?: string; isCorrect?: boolean };
  const emptyOptions: OptionType[] = [
    { text: '', tag_id: null },
    { text: '', tag_id: null },
    { text: '', tag_id: null },
    { text: '', tag_id: null }
  ];
  const [addQuestionState, setAddQuestionState] = useState<{
    text: string;
    options: OptionType[];
    correct_option: number | null;
  }>({
    text: '',
    options: emptyOptions,
    correct_option: 0
  });

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${sectionDetails.id}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setSectionDetails(prev => ({
        ...prev,
        groupId: data.groupId || prev.groupId || (section as any).groupId,
        tags: data.tags || prev.tags || [],
        isSingleOptionCorrect: !!data.isSingleOptionCorrect
      }));
      setIsSingleOptionCorrect(!!data.isSingleOptionCorrect);
    } catch (err) {
      setError('Could not load questions');
    } finally {
      setLoading(false);
    }
  };

  // Dedicated handler for editing a section
  const handleEditSectionSubmit = async (updatedSection: Section) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Use the updated section's tags if provided, otherwise fall back to current tags
    const tagsToUse = Array.isArray(updatedSection.tags) && updatedSection.tags.length > 0 
      ? updatedSection.tags 
      : (Array.isArray(sectionDetails.tags) && sectionDetails.tags.length > 0 ? sectionDetails.tags : []);
    
    const payload: any = {
      name: updatedSection.name,
      description: updatedSection.description,
      isSingleOptionCorrect: updatedSection.isSingleOptionCorrect ? 1 : 0
    };
    
    // Include tags if the section is not single option correct and has tags
    if (!updatedSection.isSingleOptionCorrect && tagsToUse.length > 0) {
      payload.tags = tagsToUse.map((tag: any) => ({
        name: tag.label || tag.name,
        description: tag.description
      }));
    }
    
    const raw = JSON.stringify(payload);
    // Fallback: try to get groupId from section if missing
    let groupId = sectionDetails.groupId || (section as any).groupId;
    if (!groupId) {
      alert("No groupId found for this section. Cannot update section.");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/sections/${groupId}/${sectionDetails.id}`, {
        method: "PUT",
        headers: myHeaders,
        body: raw
      });
      if (!res.ok) throw new Error('Failed to update section');
      // Update local state to trigger re-render
      setSectionDetails(prev => ({
        ...prev,
        name: updatedSection.name,
        description: updatedSection.description,
        isSingleOptionCorrect: updatedSection.isSingleOptionCorrect
      }));
      setIsSingleOptionCorrect(!!updatedSection.isSingleOptionCorrect);
      setEditSectionOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update section.");
    }
  };

  // Dedicated handler for Add Question
  const handleAddQuestion = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
        let options;
        let correct_option = addQuestionState.correct_option;
        
        // Always include tag_id for all options, regardless of section type
        // This ensures database consistency and allows for switching section types later
        options = addQuestionState.options.map(opt => ({
          text: opt.text,
          tag_id: typeof opt.tag_id === 'number' ? opt.tag_id : null, // Using null instead of undefined for JSON
          tag_name_display: opt.tag_name_display // Preserve the display name if available
        }));
        
        // Only set correct_option to null for multi-tag sections
        if (!sectionDetails.isSingleOptionCorrect) {
          correct_option = null;
        }
        const raw = JSON.stringify({
          text: addQuestionState.text,
          options,
          correct_option,
          sectionId: sectionDetails.id
        });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${sectionDetails.id}`, {
        method: "POST",
        headers: myHeaders,
        body: raw
      });
      if (!res.ok) throw new Error('Failed to add question');
      setAddQuestionOpen(false);
      setAddQuestionState({ text: '', options: emptyOptions, correct_option: 0 });
      await fetchQuestions();
    } catch (err) {
      alert('Failed to add question.');
      console.error(err);
    }
  };

  // Dedicated handler for Edit Question
  const handleEditQuestionSave = async () => {
    if (!editQuestion || !editState) return;
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Always include tag_id for all options
    const options = editState.options.map((opt: OptionType) => ({
      text: typeof opt.text === 'string' ? opt.text : String(opt),
      tag_id: typeof opt.tag_id === 'number' ? opt.tag_id : null,
      tag_name_display: opt.tag_name_display // Preserve display name
    }));
    const raw = JSON.stringify({
      text: editState.text,
      questionText: editState.text,
      options,
      correct_option: editState.correct_option
    });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${editQuestion.id}`, {
        method: "PUT",
        headers: myHeaders,
        body: raw
      });
      if (!res.ok) throw new Error('Failed to update question');
      await res.json();
      setEditQuestion(null);
      setEditState(null);
      await fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Failed to update question.");
    }
  };

  // Dedicated handler for Delete Question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${questionId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error('Failed to delete question');
      await fetchQuestions();
    } catch (err) {
      alert('Failed to delete question.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (!open || !section.id) return;
    setSectionDetails({
      id: section.id,
      name: section.name,
      description: section.description,
      isSingleOptionCorrect: section.isSingleOptionCorrect,
      groupId: (section as any).groupId,
      tags: (section as any).tags || [],
    });
    fetchQuestions();
  }, [section.id, open]);

  if (!open) return null;

  // Dedicated handler for opening Add Question modal
  const handleOpenAddQuestion = () => {
    setAddQuestionState({ text: '', options: emptyOptions, correct_option: 0 });
    setAddQuestionOpen(true);
  };

  // Dedicated handler for opening Edit Question modal
  const handleOpenEditQuestion = (q: any) => {
    setEditQuestion(q);
    // Always map options to {text, tag_id} objects
    let processedOptions: OptionType[] = [];
    if (q.options && Array.isArray(q.options)) {
      processedOptions = q.options.map((opt: any) => {
        if (typeof opt === 'object' && opt !== null) {
          return {
            text: typeof opt.text === 'string' ? opt.text : String(opt),
            tag_id: typeof opt.tag_id === 'number' ? opt.tag_id : null,
            tag_name_display: opt.tag_name_display
          };
        } else {
          return { text: String(opt), tag_id: null };
        }
      });
    }
    setEditState({
      text: q.text || q.questionText || '',
      options: processedOptions,
      correct_option: q.correct_option
    });
  };

  // Dedicated handler for Generate Questions button
  const handleGenerateQuestions = () => {
    window.location.href = `/questions/generate?sectionId=${sectionDetails.id}`;
  };

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
            <CardTitle className="text-xl flex-1">{sectionDetails.name}</CardTitle>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-gray-500 hover:text-black"
                title="Edit Section"
                onClick={() => setEditSectionOpen(true)}
              >
                <Pencil className="w-5 h-5" />
              </Button>
            </div>
      {/* Edit Section Modal using SectionForm */}
      {editSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <SectionForm
            open={editSectionOpen}
            onClose={() => setEditSectionOpen(false)}
            initialData={{
              id: sectionDetails.id,
              name: sectionDetails.name,
              description: sectionDetails.description,
              isSingleOptionCorrect: !!sectionDetails.isSingleOptionCorrect,
              tags: sectionDetails.tags
            }}
            onSubmit={async (updatedSection: Section & { tags?: any[] }) => {
              // Update tags in local state if changed
              if (Array.isArray(updatedSection.tags)) {
                setSectionDetails(prev => ({ ...prev, tags: updatedSection.tags }));
              }
              await handleEditSectionSubmit(updatedSection);
            }}
          />
        </div>
      )}
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <span className="font-semibold">Description:</span> {sectionDetails.description || "No description"}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Questions:</span> {questions.length}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <span className="font-semibold">Single Option Correct:</span>
              <Switch
                checked={!!sectionDetails.isSingleOptionCorrect}
                disabled
                className="data-[state=checked]:bg-green-500"
              />
            </div>
            {/* Section Tags */}
            {Array.isArray(sectionDetails.tags) && sectionDetails.tags.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold block mb-1">Tags:</span>
                <ul className="space-y-2">
                  {sectionDetails.tags.map((tag: any, idx: number) => (
                    <li key={idx} className="border rounded p-2 bg-gray-50">
                      <div className="font-medium text-sm text-gray-800">{tag.label || tag.name || `Tag ${idx + 1}`}</div>
                      {tag.description && (
                        <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">{tag.description}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Questions</h3>
          <div className="flex gap-2">
            {/* Generate Questions button */}
            <Button
              className="ml-4"
              variant="default"
              onClick={handleGenerateQuestions}
            >
              Generate Questions
            </Button>
            {/* Add Question button */}
            <Button
              variant="outline"
              onClick={handleOpenAddQuestion}
            >
              Add Question
            </Button>
      {/* Add Question Modal */}
      {addQuestionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black p-2 rounded hover:bg-gray-100"
              onClick={() => setAddQuestionOpen(false)}
              title="Close"
              style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: 1 }}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Add Question</h2>
            <div className="mb-4">
              <span className="font-semibold">Question:</span>
              <input
                className="mt-2 p-2 border rounded bg-gray-50 w-full text-base"
                value={addQuestionState.text}
                onChange={e => setAddQuestionState(prev => ({ ...prev, text: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <span className="font-semibold">Options:</span>
              <ul className="mt-2">
                {addQuestionState.options.map((opt, i) => {
                  // Find selected tag object for display
                  let selectedTag = null;
                  if (!sectionDetails.isSingleOptionCorrect) {
                    if (opt.tag_name_display) {
                      // If we have a tag_name_display, create a temporary tag object for display
                      selectedTag = {
                        id: null,
                        name: opt.tag_name_display,
                        description: ''
                      };
                    } else if (typeof opt.tag_id === 'number') {
                      selectedTag = sectionDetails.tags.find((tag: any) => tag.id === opt.tag_id);
                    }
                  }
                  return (
                    <li
                      key={i}
                      className={`flex flex-col gap-1 px-3 py-2 rounded mb-1 text-black relative ${sectionDetails.isSingleOptionCorrect && addQuestionState.correct_option === i ? 'border-2 border-black font-bold z-10' : 'border border-gray-300'} bg-white`}
                      style={{ cursor: sectionDetails.isSingleOptionCorrect ? 'pointer' : 'default' }}
                      onClick={sectionDetails.isSingleOptionCorrect ? () => setAddQuestionState(prev => ({ ...prev, correct_option: i })) : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-6 h-6 text-center font-bold rounded-full bg-gray-100 border mr-2">{String.fromCharCode(65 + i)}</span>
                        <input
                          className="flex-1 bg-transparent border-none outline-none text-base"
                          value={opt.text}
                          onChange={e => {
                            const newOptions = [...addQuestionState.options];
                            newOptions[i] = { ...newOptions[i], text: e.target.value };
                            setAddQuestionState(prev => ({ ...prev, options: newOptions }));
                          }}
                        />
                        {sectionDetails.isSingleOptionCorrect && addQuestionState.correct_option === i && (
                          <span className="ml-2 px-2 py-1 rounded bg-green-500 text-white text-xs font-semibold border border-green-500">Correct</span>
                        )}
                        {!sectionDetails.isSingleOptionCorrect && (
                          <div className="flex items-center w-40">
                            <Select
                              value={typeof opt.tag_id === 'number' ? String(opt.tag_id) : ''}
                              onValueChange={val => {
                                // Ensure tag_id is always a number or null (not undefined)
                                const tagIdNum = val !== '' && !isNaN(Number(val)) ? Number(val) : null;
                                const newOptions = [...addQuestionState.options];
                                newOptions[i] = { ...newOptions[i], tag_id: tagIdNum };
                                setAddQuestionState(prev => ({ ...prev, options: newOptions }));
                              }}
                            >
                              <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary rounded shadow-sm">
                                <SelectValue placeholder="Select tag" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border rounded shadow-lg">
                                {sectionDetails.tags.map((tag: any, idx: number) => (
                                  <SelectItem key={tag.id ?? idx} value={String(tag.id)} className="hover:bg-gray-100 cursor-pointer">
                                    <div className="flex flex-col">
                                      <span className="font-medium">{tag.label || tag.name}</span>
                                      {/* <span className="text-xs text-gray-400">ID: {tag.id}</span> */}
                                      {/* {tag.description && <span className="text-xs text-gray-500">{tag.description}</span>} */}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      {/* Show selected tag at the top if chosen */}
                      {/* {!sectionDetails.isSingleOptionCorrect && (
                        <div className={`text-xs rounded px-2 py-1 mt-1 w-fit ${selectedTag ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
                          {selectedTag ? (
                            <>
                              {opt.tag_name_display ? (
                                <span className="font-semibold">{opt.tag_name_display}</span>
                              ) : (
                                <>
                                  <span className="font-semibold">{selectedTag.label || selectedTag.name}</span>
                                  {selectedTag.description && <span className="ml-2 text-gray-500">({selectedTag.description})</span>}
                                </>
                              )}
                            </>
                          ) : (
                            <span className="italic">No tag selected</span>
                          )}
                        </div>
                      )} */}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 text-white font-semibold"
                onClick={handleAddQuestion}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>

        {/* Loading / Error / Questions Grid */}
        {loading && <div className="text-muted-foreground mb-4">Loading questions...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {!loading && !error && questions.length > 0 && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {questions.map((q: any, idx: number) => (
              <Card key={q.id || idx} className="border-gray-200 bg-white hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-black flex-1">
                    {q.text || q.questionText || `Question ${idx + 1}`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      className="ml-4 p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-black transition"
                      title="Edit Question"
                      onClick={() => handleOpenEditQuestion(q)}
                      type="button"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition"
                      title="Delete Question"
                      onClick={() => handleDeleteQuestion(q.id)}
                      type="button"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {q.options && Array.isArray(q.options) && (
                    <ul className="list-none ml-0 mt-2">
                      {q.options.map((opt: any, i: number) => {
                        // For multi-tag (single correct option is false), show tag dropdown (disabled) on right
                        if (!sectionDetails.isSingleOptionCorrect) {
                          // Find selected tag for this option
                          let selectedTag = null;
                          if (typeof opt.tag_id === 'number') {
                            selectedTag = sectionDetails.tags.find((tag: any) => tag.id === opt.tag_id);
                          }
                          return (
                            <li key={i} className="flex items-center gap-2 px-3 py-2 rounded mb-1 bg-gray-50 border border-gray-200 text-black">
                              <span className="inline-block w-6 h-6 text-center font-bold rounded-full bg-white border mr-2">{String.fromCharCode(65 + i)}</span>
                              <span className="flex-1">{typeof opt === 'object' && opt !== null ? opt.text ?? JSON.stringify(opt) : String(opt)}</span>
                              <div className="w-40">
                                <Select value={typeof opt.tag_id === 'number' ? String(opt.tag_id) : ''} disabled>
                                  <SelectTrigger className="w-full border-gray-300 rounded shadow-sm bg-gray-100 cursor-not-allowed">
                                    <SelectValue placeholder="Select tag" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border rounded shadow-lg">
                                    {sectionDetails.tags.map((tag: any, idx: number) => (
                                      <SelectItem key={tag.id ?? idx} value={String(tag.id)} className="hover:bg-gray-100 cursor-pointer">
                                        <div className="flex flex-col">
                                          <span className="font-medium">{tag.label || tag.name}</span>
                                          {/* <span className="text-xs text-gray-400">ID: {tag.id}</span>
                                          {tag.description && <span className="text-xs text-gray-500">{tag.description}</span>} */}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </li>
                          );
                        } else {
                          // Single correct option: show as before
                          return (
                            <li key={i} className={`flex items-center gap-2 px-3 py-2 rounded mb-1 ${q.correct_option === i ? 'bg-green-100 border border-green-400 text-black font-bold' : 'bg-gray-50 border border-gray-200 text-black'}`}>
                              <span className="inline-block w-6 h-6 text-center font-bold rounded-full bg-white border mr-2">{String.fromCharCode(65 + i)}</span>
                              <span>{typeof opt === 'object' && opt !== null ? opt.text ?? JSON.stringify(opt) : String(opt)}</span>
                              {q.correct_option === i && (
                                <span className="ml-2 px-2 py-1 rounded bg-green-400 text-white text-xs font-semibold">Correct</span>
                              )}
                            </li>
                          );
                        }
                      })}
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
                onChange={e => setEditState(prev => prev ? ({ ...prev, text: e.target.value }) : null)}
              />
            </div>
            {Array.isArray(editState.options) && (
              <div className="mb-4">
                <span className="font-semibold">Options:</span>
                <ul className="mt-2">
                  {editState.options.map((opt: OptionType, i: number) => {
                    // Find selected tag if this option has a tag_id
                    let selectedTag = null;
                    if (!sectionDetails.isSingleOptionCorrect && typeof opt.tag_id === 'number') {
                      selectedTag = sectionDetails.tags.find((tag: any) => tag.id === opt.tag_id);
                    }
                    return (
                      <li
                        key={i}
                        className={`flex flex-col gap-1 px-3 py-2 rounded mb-1 text-black relative ${sectionDetails.isSingleOptionCorrect && editState.correct_option === i ? 'border-2 border-black font-bold' : 'border border-gray-300'} bg-white ${sectionDetails.isSingleOptionCorrect && editState.correct_option === i ? 'z-10' : ''}`}
                        style={{ cursor: sectionDetails.isSingleOptionCorrect ? 'pointer' : 'default' }}
                        onClick={sectionDetails.isSingleOptionCorrect ? () => setEditState(prev => prev ? ({ ...prev, correct_option: i }) : null) : undefined}
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-6 h-6 text-center font-bold rounded-full bg-gray-100 border mr-2">{String.fromCharCode(65 + i)}</span>
                          <input
                            className="flex-1 bg-transparent border-none outline-none text-base"
                            value={opt.text}
                            onChange={e => {
                              const newOptions = [...editState.options];
                              newOptions[i] = { ...opt, text: e.target.value };
                              setEditState(prev => prev ? ({ ...prev, options: newOptions }) : null);
                            }}
                          />
                          {sectionDetails.isSingleOptionCorrect && editState.correct_option === i && (
                            <span className="ml-2 px-2 py-1 rounded bg-green-500 text-white text-xs font-semibold border border-green-500">Correct</span>
                          )}
                          {/* Add dropdown for tag selection in non-single option correct mode */}
                          {!sectionDetails.isSingleOptionCorrect && (
                            <div className="flex items-center w-40">
                              <Select
                                value={typeof opt.tag_id === 'number' ? String(opt.tag_id) : ''}
                                onValueChange={val => {
                                  const tagIdNum = val !== '' && !isNaN(Number(val)) ? Number(val) : null;
                                  const newOptions = [...editState.options];
                                  newOptions[i] = { ...opt, tag_id: tagIdNum };
                                  setEditState(prev => prev ? ({ ...prev, options: newOptions }) : null);
                                }}
                              >
                                <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary rounded shadow-sm">
                                  <SelectValue placeholder="Select tag" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border rounded shadow-lg">
                                  {sectionDetails.tags.map((tag: any, idx: number) => (
                                    <SelectItem key={tag.id ?? idx} value={String(tag.id)} className="hover:bg-gray-100 cursor-pointer">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{tag.label || tag.name}</span>
                                        {/* <span className="text-xs text-gray-400">ID: {tag.id}</span>
                                        {tag.description && <span className="text-xs text-gray-500">{tag.description}</span>} */}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        {/* Show selected tag at the top if chosen */}
                        {/* {!sectionDetails.isSingleOptionCorrect && (
                          <div className={`text-xs rounded px-2 py-1 mt-1 w-fit ${selectedTag ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'}`}>
                            {selectedTag ? (
                              <>
                                <span className="font-bold">Tag ID: {opt.tag_id}</span> - <span className="font-semibold">{selectedTag.label || selectedTag.name}</span>
                                {selectedTag.description && <span className="ml-2 text-gray-500">({selectedTag.description})</span>}
                              </>
                            ) : (
                              <span className="italic">No tag selected</span>
                            )}
                          </div>
                        )} */}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 text-white font-semibold"
                onClick={handleEditQuestionSave}
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
