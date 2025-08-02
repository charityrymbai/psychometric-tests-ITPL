import { Request, Response } from 'express';
import * as questionsService from '../services/questionsService.js';

export const getQuestions = (req: Request, res: Response) => {
  res.send('Questions Home');
};

export const createQuestion = (req: Request, res: Response) => {
  const questionData = req.body;
  const sectionId = req.params.sectionId;
  const createdQuestion = questionsService.createQuestion(questionData, sectionId);
  res.status(201).json(createdQuestion);
};

export const updateQuestion = async (req: Request, res: Response) => {
  const questionData = req.body;
  const questionId = req.params.questionId;
  const updatedQuestion = await questionsService.updateQuestion(questionId, questionData);
  res.status(200).json(updatedQuestion);
};

export const deleteQuestion = (req: Request, res: Response) => {
  questionsService.deleteQuestion(req.params.id);
  res.status(204).send();
};

export const getQuestionsBySection = async (req: Request, res: Response) => {
  const sectionId = req.params.sectionId;
  const maxQuestions = req.query.maxQuestions ? parseInt(req.query.maxQuestions as string) : undefined;
  
  try {
    const questions = await questionsService.getQuestionsBySection(sectionId, maxQuestions);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions for section' });
  }
};
