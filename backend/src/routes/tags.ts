import { Router } from "express";
import * as tagsController from "../controllers/tagsController.js";

const router = Router();

router.get('/', tagsController.getTags);
router.get('/section/:sectionId', tagsController.getTagsBySection);
router.post('/', tagsController.createTag);
router.post('/:sectionId', tagsController.createTagForSection);
router.put('/:id', tagsController.updateTag);
router.delete('/:id', tagsController.deleteTag);

export default router;
