"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle } from "lucide-react";

interface QuestionCreatePageProps {
  section?: any;
  onClose?: () => void;
  open?: boolean;
}

export default function QuestionCreatePage({ section, onClose, open }: QuestionCreatePageProps) {
  if (!open) return null;
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>([""]);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);

  function handleOptionChange(idx: number, value: string) {
    setOptions(options.map((opt, i) => (i === idx ? value : opt)));
  }

  function handleAddOption() {
    setOptions([...options, ""]);
  }

  function handleSelectCorrect(idx: number) {
    setCorrectIndex(idx);
  }

  function handleGenerate() {
    // TODO: Implement generate logic
    alert("Generate clicked!");
  }

  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow p-6 border relative">
      <button
        className="absolute top-4 right-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={handleGenerate}
      >
        Generate
      </button>
      <h2 className="text-2xl font-semibold mb-4">Create Question</h2>
      <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleGenerate(); }}>
        <div>
          <label className="block text-sm font-medium mb-1">Question Text</label>
          <Input
            placeholder="Enter your question here"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Options</label>
          <div className="flex flex-col gap-4">
            {options.map((opt, idx) => (
              <div key={idx} className="relative flex items-center p-4 bg-gray-50 rounded-lg border">
                <input
                  type="radio"
                  name="correctOption"
                  checked={correctIndex === idx}
                  onChange={() => handleSelectCorrect(idx)}
                  className="w-5 h-5 mr-3 accent-blue-600"
                />
                <Input
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
            ))}
            <div className="flex justify-center mt-2">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded hover:bg-blue-200 text-blue-700"
                onClick={handleAddOption}
              >
                <Plus className="w-5 h-5" /> Add Option
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Add the options as needed and select the correct answer by checking one of the boxes.</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    </div>
  );
}
