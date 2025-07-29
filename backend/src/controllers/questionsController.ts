import * as questionsService from '../services/questionsService.js';

export const getQuestions = (req, res) => {
  res.send('Questions Home');
};

export const createQuestion = (req, res) => {
  const questionData = req.body;
  const sectionId = req.params.sectionId;
  const createdQuestion = questionsService.createQuestion(questionData, sectionId);
  res.status(201).json(createdQuestion);
};

export const updateQuestion = async (req, res) => {
  const questionData = req.body;
  const questionId = req.params.questionId;
  const updatedQuestion = await questionsService.updateQuestion(questionId, questionData);
  res.status(200).json(updatedQuestion);
};

export const deleteQuestion = (req, res) => {
  questionsService.deleteQuestion(req.params.id);
  res.status(204).send();
};

export const getQuestionsBySection = async (req, res) => {
  const sectionId = req.params.sectionId;
  try {
    const questions = await questionsService.getQuestionsBySection(sectionId);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions for section' });
  }
};
