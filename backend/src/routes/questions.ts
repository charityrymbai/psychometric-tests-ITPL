import { Router } from "express";
import * as questionsController from "../controllers/questionsController.js";

const router = Router();

router.get('/', questionsController.getQuestions);
router.post('/:sectionId', questionsController.createQuestion);
router.put('/:questionId', questionsController.updateQuestion);
router.delete('/:id', questionsController.deleteQuestion);
router.get('/:sectionId', questionsController.getQuestionsBySection);

export default router;
