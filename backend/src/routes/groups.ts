import { Router } from "express";
import * as groupsController from "../controllers/groupsController.js"

const router = Router();

router.get('/getAll', groupsController.getGroups);
router.post('/create', groupsController.createGroup);
router.put('/update/:id', groupsController.updateGroup);
router.delete('/delete/:id', groupsController.deleteGroup);

export default router;
