import { Router } from "express";
import * as sectionsController from "../controllers/sectionsController.js";

const router = Router();

router.get('/', sectionsController.getSections);
router.get('/:groupId', sectionsController.getSectionByGroupId);
router.post('/create/:groupId', sectionsController.createSection);
router.put('/:groupId/:sectionId', sectionsController.updateSection);
router.delete('/delete/:sectionId', sectionsController.deleteSection);

export default router;
