import { Router } from "express";
import * as tagsController from "../controllers/tagsController";

const router = Router();

router.get('/', tagsController.getTags);
router.post('/', tagsController.createTag);
router.put('/:id', tagsController.updateTag);
router.delete('/:id', tagsController.deleteTag);

export default router;
