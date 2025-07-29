import { Router } from "express";
import * as sectionsController from "../controllers/sectionsController.js";

const router = Router();

router.get('/', sectionsController.getSections);
router.post('/create/:groupId', sectionsController.createSection);
router.put('/update/:id', sectionsController.updateSection);
router.delete('/delete/:id', sectionsController.deleteSection);

export default router;
