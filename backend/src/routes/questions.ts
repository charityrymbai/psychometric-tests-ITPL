import { Router } from "express";
import * as questionsController from "../controllers/questionsController";

const router = Router();

router.delete('/:id', questionsController.deleteQuestion);
router.get('/', questionsController.getQuestions);
router.post('/', questionsController.createQuestion);
router.put('/', questionsController.updateQuestion);

export default router;
