// This is the Questions Generation Page
// Uses presentation-ai service for AI-powered question generation

'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash, Check, Pencil, Loader2, Sparkles, RefreshCw, Edit, Plus, Tags } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types for question structure
type QuestionOption = {
  text: string;
  tag_id?: number | null;
  temp_tag_id?: string; // For newly generated tags without backend IDs
};

type Question = {
  id: number;
  text: string;
  options: QuestionOption[];
  correct_option?: number | null;
  type: string;
};

type Tag = {
  id: number;
  name: string;
  description?: string;
};

type GeneratedTag = {
  temp_id: string;
  name: string;
  description?: string;
  isNew: boolean;
};

type SectionData = {
  sectionId: string;
  sectionName: string;
  groupId: string;
  groupName: string;
  isSingleOptionCorrect: boolean;
  startingClass?: number;
  endingClass?: number;
  questions: Question[];
  tags: Tag[];
};

type GenerationParams = {
  num_questions: number;
  question_style: string;
  question_types: string[];
  additional_requirements: string;
  ensure_tag_balance: boolean;
};

function GenerateQuestionsContent() {
  const searchParams = useSearchParams();
  const sectionId = searchParams.get('sectionId');

  // State management
  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editing, setEditing] = useState<Record<number, boolean>>({});
  
  // Generated tags management
  const [generatedTags, setGeneratedTags] = useState<GeneratedTag[]>([]);
  const [tagCounter, setTagCounter] = useState<number>(0);
  
  // Tag editing and adding state
  const [editingTag, setEditingTag] = useState<{id?: number, temp_id?: string, name: string, description: string} | null>(null);
  const [showAddTag, setShowAddTag] = useState<boolean>(false);
  const [newTagData, setNewTagData] = useState<{name: string, description: string}>({name: '', description: ''});
  
  // Generation state
  const [generating, setGenerating] = useState<boolean>(false);
  const [generationJobId, setGenerationJobId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [pollAttempts, setPollAttempts] = useState<number>(0);
  
  // Generation parameters
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    num_questions: 10,
    question_style: 'multiple_choice',
    question_types: ['mcq'],
    additional_requirements: '',
    ensure_tag_balance: true
  });

  // Helper functions for tag management
  const generateTempTagId = () => {
    const newId = `temp_${tagCounter}`;
    setTagCounter(prev => prev + 1);
    return newId;
  };

  const getAllAvailableTags = () => {
    const existingTags = sectionData?.tags?.map(tag => ({
      ...tag,
      temp_id: `existing_${tag.id}`,
      isNew: false
    })) || [];
    
    return [...existingTags, ...generatedTags];
  };

  const handleDeleteGeneratedTag = (tempId: string) => {
    // Remove tag from generated tags
    setGeneratedTags(prev => prev.filter(tag => tag.temp_id !== tempId));
    
    // Clear any options that were using this tag
    setQuestions(prev => prev.map(q => ({
      ...q,
      options: q.options.map(opt => 
        opt.temp_tag_id === tempId 
          ? { ...opt, temp_tag_id: undefined, tag_id: null }
          : opt
      )
    })));
  };

  // Tag management handlers
  const handleEditTag = (tag: {id?: number, temp_id?: string, name: string, description: string}) => {
    setEditingTag(tag);
  };

  const handleSaveTagEdit = async () => {
    if (!editingTag) return;
    
    try {
      if (editingTag.id) {
        // Editing existing tag
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/tags/${editingTag.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editingTag.name,
            description: editingTag.description,
            section_id: sectionData?.sectionId
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update tag: ${response.statusText}`);
        }
        
        // Update local state with edited tag
        if (sectionData) {
          setSectionData({
            ...sectionData,
            tags: sectionData.tags.map(tag => 
              tag.id === editingTag.id 
                ? { ...tag, name: editingTag.name, description: editingTag.description }
                : tag
            )
          });
        }
      } else if (editingTag.temp_id) {
        // Editing generated tag
        setGeneratedTags(prev => prev.map(tag => 
          tag.temp_id === editingTag.temp_id 
            ? { ...tag, name: editingTag.name, description: editingTag.description }
            : tag
        ));
      }
      setEditingTag(null);
    } catch (error) {
      console.error('Error saving tag edit:', error);
    }
  };

  const handleCancelTagEdit = () => {
    setEditingTag(null);
  };

  const handleAddNewTag = () => {
    setShowAddTag(true);
    setNewTagData({name: '', description: ''});
  };

  const handleSaveNewTag = () => {
    if (!newTagData.name.trim()) return;
    
    const newTag: GeneratedTag = {
      temp_id: generateTempTagId(),
      name: newTagData.name.trim(),
      description: newTagData.description.trim(),
      isNew: true
    };
    
    setGeneratedTags(prev => [...prev, newTag]);
    setShowAddTag(false);
    setNewTagData({name: '', description: ''});
  };

  const handleCancelNewTag = () => {
    setShowAddTag(false);
    setNewTagData({name: '', description: ''});
  };

  const validateQuestionsForSave = (): string[] => {
    const warnings: string[] = [];
    questions.forEach((question, qIndex) => {
      question.options.forEach((option, oIndex) => {
        if (!sectionData?.isSingleOptionCorrect && !option.tag_id && !option.temp_tag_id) {
          warnings.push(`Question ${qIndex + 1}, Option ${oIndex + 1}: No tag assigned`);
        }
      });
    });
    return warnings;
  };

  // Helper function to get available question styles based on isSingleOptionCorrect
  const getAvailableQuestionStyles = () => {
    // Only score-based sections (isSingleOptionCorrect = true) have question styles
    if (!sectionData?.isSingleOptionCorrect) {
      return [];
    }

    // For score-based sections, allow multiple choice, true/false, and mixed
    return [
      { value: 'multiple_choice', label: 'Multiple Choice' },
      { value: 'true_false', label: 'True/False' },
      { value: 'mixed', label: 'Mixed (Multiple Choice + True/False)' }
    ];
  };

  // Fetch section data on mount
  useEffect(() => {
    if (!sectionId) {
      setError('No section ID provided');
      setLoading(false);
      return;
    }

    const fetchSectionData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${sectionId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch section data: ${response.statusText}`);
        }

        const data = await response.json();

        setSectionData({
          sectionId: data.sectionId || sectionId,
          sectionName: data.sectionName || 'Unknown Section',
          groupId: data.groupId || '',
          groupName: data.groupName || 'Unknown Group',
          isSingleOptionCorrect: data.isSingleOptionCorrect || false,
          startingClass: data.startingClass,
          endingClass: data.endingClass,
          questions: data.questions || [],
          tags: data.tags || []
        });

        // Don't set existing questions in the display - only show newly generated ones
        // Keep existing questions for count display only

      } catch (err: any) {
        console.error('Error fetching section data:', err);
        setError(err.message || 'Failed to load section data');
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, [sectionId]);

  // Update generation parameters when section data changes
  useEffect(() => {
    if (sectionData) {
      const availableStyles = getAvailableQuestionStyles();

      setGenerationParams(prev => ({
        ...prev,
        question_style: availableStyles.length > 0 
          ? (availableStyles.find(s => s.value === prev.question_style)?.value || availableStyles[0].value)
          : '' // Clear for tag-based sections where no styles are available
      }));
    }
  }, [sectionData]);

  // Poll for generation status
  useEffect(() => {
    if (!generationJobId || !generating) return;

    const MAX_POLL_ATTEMPTS = 150; // 5 minutes at 2-second intervals

    const pollStatus = async () => {
      try {
        setPollAttempts(prev => prev + 1);
        
        // Stop polling after maximum attempts
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          setGenerating(false);
          setGenerationProgress('Generation timed out');
          setError('Question generation timed out. Please try again.');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/job-status/${generationJobId}`);
        const result = await response.json();

        if (result.status === 'COMPLETED' || result.status === 'completed') {
          setGenerating(false);
          setPollAttempts(0);
          setGenerationProgress('Generation completed!');
          
          if (result.result && result.result.questions) {
            // Create mapping from temporary numeric IDs back to temp_ids for generated tags
            const tempIdMapping: Record<number, string> = {};
            generatedTags.forEach((tag, index) => {
              tempIdMapping[10000 + index] = tag.temp_id;
            });

            const newQuestions = result.result.questions.map((q: any, index: number) => {
              // Process options to map temporary tag IDs back to temp_ids
              const processedOptions = q.options?.map((opt: any) => {
                if (opt.tag_id && opt.tag_id >= 10000) {
                  // This is a generated tag, map back to temp_id
                  return {
                    ...opt,
                    tag_id: null,
                    temp_tag_id: tempIdMapping[opt.tag_id]
                  };
                }
                // Keep existing database tag IDs as-is
                return opt;
              }) || [];

              return {
                ...q,
                id: Date.now() + index, // Temporary ID for new questions
                options: processedOptions
              };
            });
            
            // Handle suggested tags
            if (result.result.suggested_tags) {
              const newTags: GeneratedTag[] = result.result.suggested_tags.map((tag: any) => ({
                temp_id: generateTempTagId(),
                name: tag.name,
                description: tag.description,
                isNew: true
              }));
              setGeneratedTags(prev => [...prev, ...newTags]);
            }
            
            setQuestions(prev => [...prev, ...newQuestions]);
            setEditing(prev => ({
              ...prev,
              ...newQuestions.reduce((acc: any, q: Question) => ({ ...acc, [q.id]: true }), {})
            }));
          }
        } else if (result.status === 'FAILED' || result.status === 'failed') {
          setGenerating(false);
          setPollAttempts(0);
          setGenerationProgress('Generation failed');
          setError(result.error || 'Question generation failed');
        } else {
          setGenerationProgress(result.message || `Generating questions... (${pollAttempts}/${MAX_POLL_ATTEMPTS})`);
        }
      } catch (err) {
        console.error('Error polling status:', err);
        setPollAttempts(prev => prev + 1);
      }
    };

    const interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [generationJobId, generating, pollAttempts]);

  // Generate questions using AI
  const handleGenerateQuestions = async () => {
    if (!sectionData) return;

    try {
      setGenerating(true);
      setError(null);
      setPollAttempts(0); // Reset poll attempts
      setGenerationProgress('Starting generation...');

      // Clean generation params - remove empty question_style for tag-based sections
      const cleanedParams: any = { ...generationParams };
      if (!sectionData.isSingleOptionCorrect || !cleanedParams.question_style) {
        delete cleanedParams.question_style;
      }

      // Combine existing tags and generated tags for AI processing
      const allTags = [
        // Existing tags with database IDs
        ...(sectionData.tags || []),
        // Generated tags with temporary numeric IDs (starting from 10000 to avoid conflicts)
        ...generatedTags.map((tag, index) => ({
          id: 10000 + index, // Temporary numeric ID for AI processing
          name: tag.name,
          description: tag.description,
          temp_id: tag.temp_id // Keep temp_id for frontend reference
        }))
      ];

      const requestBody = {
        section_id: sectionData.sectionId,
        section_name: sectionData.sectionName,
        section_description: `Questions for ${sectionData.sectionName}`,
        group_id: sectionData.groupId,
        group_name: sectionData.groupName,
        is_single_option_correct: sectionData.isSingleOptionCorrect,
        tags: allTags,
        existing_questions: sectionData.questions, // Use existing questions from sectionData for AI context
        generation_params: cleanedParams,
        // For tag-based generation, request tag suggestions
        request_tag_suggestions: !sectionData.isSingleOptionCorrect
      };

      console.log('Sending generation request:', requestBody);

      const response = await fetch(`${process.env.NEXT_PUBLIC_AI_SERVICE_URL}/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (response.ok && result.job_id) {
        setGenerationJobId(result.job_id);
        setGenerationProgress(result.message);
      } else {
        throw new Error(result.error || 'Failed to start question generation');
      }

    } catch (err: any) {
      console.error('Error generating questions:', err);
      setError(err.message || 'Failed to generate questions');
      setGenerating(false);
    }
  };

  // Question editing handlers
  const handleDelete = (id: number) => {
    setQuestions(qs => qs.filter(q => q.id !== id));
    setEditing(ed => {
      const newEditing = { ...ed };
      delete newEditing[id];
      return newEditing;
    });
  };

  const handleApprove = (id: number) => {
    setEditing(ed => ({ ...ed, [id]: false }));
  };

  const handleEdit = (id: number) => {
    setEditing(ed => ({ ...ed, [id]: true }));
  };

  const handleQuestionChange = (id: number, value: string) => {
    setQuestions(qs =>
      qs.map(q => (q.id === id ? { ...q, text: value } : q))
    );
  };

  const handleOptionChange = (qid: number, idx: number, value: string) => {
    setQuestions(qs =>
      qs.map(q =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((opt, i) => 
                i === idx ? { ...opt, text: value } : opt
              )
            }
          : q
      )
    );
  };

  const handleOptionTagChange = (qid: number, idx: number, tagValue: string) => {
    setQuestions(qs =>
      qs.map(q =>
        q.id === qid
          ? {
              ...q,
              options: q.options.map((opt, i) => {
                if (i === idx) {
                  if (tagValue === '' || tagValue === '__no_tag__') {
                    return { ...opt, tag_id: null, temp_tag_id: undefined };
                  } else if (tagValue.startsWith('existing_')) {
                    const tagId = parseInt(tagValue.replace('existing_', ''));
                    return { ...opt, tag_id: tagId, temp_tag_id: undefined };
                  } else {
                    return { ...opt, tag_id: null, temp_tag_id: tagValue };
                  }
                }
                return opt;
              })
            }
          : q
      )
    );
  };

  const handleCorrectChange = (qid: number, idx: number) => {
    setQuestions(qs =>
      qs.map(q => (q.id === qid ? { ...q, correct_option: idx } : q))
    );
  };

  // Save questions to backend
  const handleSave = async () => {
    if (!sectionData) return;

    // Validate questions first
    const warnings = validateQuestionsForSave();
    if (warnings.length > 0) {
      const confirmed = window.confirm(
        `Warning: The following issues were found:\n\n${warnings.join('\n')}\n\nDo you want to continue saving?`
      );
      if (!confirmed) return;
    }

    try {
      // First, create new tags in the backend
      const tagMapping: Record<string, number> = {};
      for (const tag of generatedTags) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/tags/${sectionData.sectionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: tag.name,
            description: tag.description
          })
        });
        const result = await response.json();
        if (result.id) {
          tagMapping[tag.temp_id] = result.id;
        }
      }

      // Now save each question with proper tag IDs
      for (const question of questions) {
        const processedOptions = question.options.map(opt => ({
          text: opt.text,
          tag_id: opt.temp_tag_id ? tagMapping[opt.temp_tag_id] : opt.tag_id
        }));

        const questionData = {
          text: question.text,
          options: processedOptions,
          correct_option: question.correct_option,
          type: question.type || 'mcq'
        };

        if (question.id && typeof question.id === 'number' && question.id < Date.now() - 1000000) {
          // Existing question - update
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${question.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData)
          });
        } else {
          // New question - create
          await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${sectionData.sectionId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(questionData)
          });
        }
      }

      // Navigate back to settings
      window.location.href = `/settings?sectionId=${sectionData.sectionId}`;
    } catch (err) {
      console.error('Error saving questions:', err);
      setError('Failed to save questions');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading section data...</span>
      </div>
    );
  }

  if (error && !sectionData) {
    return (
      <div className="p-8">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto mb-32">
      {/* Section Info Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">AI Question Generation</h1>
            <div className="text-lg font-semibold">Group: {sectionData?.groupName}</div>
            <div className="text-md text-gray-600">
              Section: {sectionData?.sectionName} (ID: {sectionData?.sectionId})
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Type: {sectionData?.isSingleOptionCorrect ? 'Score-based' : 'Tag-based'} | 
              {sectionData?.startingClass && sectionData?.endingClass && (
                <span> Classes: {sectionData.startingClass}-{sectionData.endingClass} | </span>
              )}
              Tags: {sectionData?.tags?.length || 0} | 
              Existing Questions: {sectionData?.questions?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Parameters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`grid grid-cols-1 gap-4 ${sectionData?.isSingleOptionCorrect ? 'md:grid-cols-2' : ''}`}>
            <div>
              <Label htmlFor="num_questions">Number of Questions</Label>
              <Input
                id="num_questions"
                type="number"
                min="1"
                max="50"
                value={generationParams.num_questions}
                onChange={(e) => setGenerationParams(prev => ({
                  ...prev,
                  num_questions: parseInt(e.target.value) || 10
                }))}
              />
            </div>

            {sectionData?.isSingleOptionCorrect && getAvailableQuestionStyles().length > 0 && (
              <div>
                <Label htmlFor="style">Question Style</Label>
                <Select
                  value={generationParams.question_style}
                  onValueChange={(value) => setGenerationParams(prev => ({
                    ...prev,
                    question_style: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableQuestionStyles().map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {!sectionData?.isSingleOptionCorrect && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <div className="font-medium mb-1">Tag-based Generation</div>
              <div>Questions will be generated with AI-suggested tags based on your existing tags and content. You can review and modify suggested tags before saving.</div>
            </div>
          )}

          <div>
            <Label htmlFor="requirements">Additional Requirements</Label>
            <Input
              id="requirements"
              placeholder="e.g., Focus on workplace scenarios, include real-world examples..."
              value={generationParams.additional_requirements}
              onChange={(e) => setGenerationParams(prev => ({
                ...prev,
                additional_requirements: e.target.value
              }))}
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleGenerateQuestions}
              disabled={generating}
              className="flex items-center gap-2"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generating ? 'Generating...' : 'Generate Questions'}
            </Button>

            {generating && (
              <div className="flex items-center text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {generationProgress}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Section Tags Management - for tag-based sections */}
      {sectionData && !sectionData.isSingleOptionCorrect && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="w-5 h-5" />
              Section Tags ({(sectionData.tags || []).length + generatedTags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Existing Tags */}
              {sectionData.tags && sectionData.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Existing Tags</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sectionData.tags.map((tag) => (
                      <div key={tag.id} className="border rounded-lg p-3 bg-gray-50">
                        {editingTag?.id === tag.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingTag.name}
                              onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                              placeholder="Tag name"
                              className="text-sm"
                            />
                            <Input
                              value={editingTag.description}
                              onChange={(e) => setEditingTag({...editingTag, description: e.target.value})}
                              placeholder="Tag description"
                              className="text-sm"
                            />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={handleSaveTagEdit}>
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancelTagEdit}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{tag.name}</div>
                              {tag.description && (
                                <div className="text-xs text-gray-600 mt-1">{tag.description}</div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTag({id: tag.id, name: tag.name, description: tag.description || ''})}
                              className="ml-2"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Tags */}
              {generatedTags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">New Tags (from Generation)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {generatedTags.map((tag) => (
                      <div key={tag.temp_id} className="border rounded-lg p-3 bg-blue-50">
                        {editingTag?.temp_id === tag.temp_id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingTag.name}
                              onChange={(e) => setEditingTag({...editingTag, name: e.target.value})}
                              placeholder="Tag name"
                              className="text-sm"
                            />
                            <Input
                              value={editingTag.description}
                              onChange={(e) => setEditingTag({...editingTag, description: e.target.value})}
                              placeholder="Tag description"
                              className="text-sm"
                            />
                            <div className="flex gap-1">
                              <Button size="sm" onClick={handleSaveTagEdit}>
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={handleCancelTagEdit}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{tag.name}</div>
                              {tag.description && (
                                <div className="text-xs text-gray-600 mt-1">{tag.description}</div>
                              )}
                              <div className="text-xs text-blue-600 mt-1">New Tag</div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTag({temp_id: tag.temp_id, name: tag.name, description: tag.description || ''})}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteGeneratedTag(tag.temp_id)}
                              >
                                <Trash className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Tag Section */}
              <div className="pt-4 border-t">
                {showAddTag ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Add New Tag</h4>
                    <div className="space-y-2">
                      <Input
                        value={newTagData.name}
                        onChange={(e) => setNewTagData({...newTagData, name: e.target.value})}
                        placeholder="Tag name"
                        className="text-sm"
                      />
                      <Input
                        value={newTagData.description}
                        onChange={(e) => setNewTagData({...newTagData, description: e.target.value})}
                        placeholder="Tag description (optional)"
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSaveNewTag}
                          disabled={!newTagData.name.trim()}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Save Tag
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelNewTag}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleAddNewTag}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Tag
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {questions.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Newly Generated Questions ({questions.length})</h2>
          
          {questions.map((q) => (
            <Card key={q.id} className="relative">
              <CardContent className="pt-6">
                {/* Action buttons */}
                <div className="absolute right-4 top-4 flex gap-2 z-10">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={() => handleDelete(q.id)} 
                    title="Delete"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                  {editing[q.id] ? (
                    <Button 
                      size="icon" 
                      onClick={() => handleApprove(q.id)} 
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleEdit(q.id)} 
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Question text */}
                <div className="mb-4 mt-2">
                  <Label className="block font-semibold mb-2">Question:</Label>
                  <Input
                    value={q.text}
                    disabled={!editing[q.id]}
                    onChange={(e) => handleQuestionChange(q.id, e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Options */}
                <div>
                  <Label className="block font-semibold mb-2">Options:</Label>
                  <div className="space-y-3">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          {sectionData?.isSingleOptionCorrect && (
                            <input
                              type="radio"
                              checked={q.correct_option === idx}
                              disabled={!editing[q.id]}
                              onChange={() => handleCorrectChange(q.id, idx)}
                              className="accent-blue-600"
                            />
                          )}
                          <Input
                            value={opt.text}
                            disabled={!editing[q.id]}
                            onChange={(e) => handleOptionChange(q.id, idx, e.target.value)}
                            className={
                              'flex-1 ' +
                              (q.correct_option === idx && sectionData?.isSingleOptionCorrect 
                                ? 'border-2 border-blue-500 bg-blue-50' 
                                : ''
                              )
                            }
                          />
                        </div>
                        
                        {!sectionData?.isSingleOptionCorrect && (
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-gray-600">Tag:</Label>
                            {editing[q.id] ? (
                              <Select
                                value={opt.temp_tag_id || (opt.tag_id ? `existing_${opt.tag_id}` : '__no_tag__')}
                                onValueChange={(value) => handleOptionTagChange(q.id, idx, value)}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Select tag" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__no_tag__">No tag</SelectItem>
                                  {getAllAvailableTags().map((tag) => (
                                    <SelectItem key={tag.temp_id} value={tag.temp_id}>
                                      {tag.name} {tag.isNew ? '(New)' : ''}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-xs text-gray-600">
                                {opt.temp_tag_id 
                                  ? generatedTags.find(t => t.temp_id === opt.temp_tag_id)?.name || 'Unknown'
                                  : opt.tag_id 
                                    ? sectionData?.tags?.find(t => t.id === opt.tag_id)?.name || `ID: ${opt.tag_id}`
                                    : 'No tag'
                                }
                                {opt.temp_tag_id && (
                                  <span className="text-blue-600 ml-1">(New)</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {sectionData?.isSingleOptionCorrect && (opt.tag_id || opt.temp_tag_id) && (
                          <div className="text-xs text-gray-500 mt-1">
                            Tag: {opt.temp_tag_id 
                              ? generatedTags.find(t => t.temp_id === opt.temp_tag_id)?.name || 'Unknown'
                              : sectionData?.tags?.find(t => t.id === opt.tag_id)?.name || opt.tag_id
                            }
                            {opt.temp_tag_id && <span className="text-blue-600 ml-1">(New)</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No questions generated yet</div>
          <div className="text-gray-400 text-sm">
            Use the generation settings above to create new questions
            {sectionData?.questions?.length && sectionData.questions.length > 0 && (
              <div className="mt-2">
                ({sectionData.questions.length} existing questions in this section)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fixed Save Button at the bottom */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center gap-4 bg-white border-t py-4 z-20">
        <Button
          variant="outline"
          className="px-8 py-2 text-lg font-semibold"
          onClick={() => {
            window.location.href = `/settings?sectionId=${sectionData?.sectionId}`;
          }}
        >
          Cancel
        </Button>
        <Button 
          className="px-8 py-2 text-lg font-semibold"
          onClick={handleSave}
          disabled={questions.length === 0}
        >
          Save New Questions ({questions.length})
        </Button>
      </div>
    </div>
  );
}

// Export the page component with Suspense
export default function GenerateQuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-lg text-gray-600">Loading question generator...</p>
        </div>
      </div>
    }>
      <GenerateQuestionsContent />
    </Suspense>
  );
}
