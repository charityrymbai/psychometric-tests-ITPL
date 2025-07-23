import { Router } from "express";
import * as sectionsController from "../controllers/sectionsController";

const router = Router();

router.get('/', sectionsController.getSections);
router.get('/create', sectionsController.createSection);
router.get('/update/:id', sectionsController.updateSection);
router.get('/delete/:id', sectionsController.deleteSection);

export default router;
