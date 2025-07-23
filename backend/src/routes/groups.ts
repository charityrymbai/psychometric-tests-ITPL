import { Router } from "express";
import * as groupsController from "../controllers/groupsController"

const router = Router();

router.get('/getAll', groupsController.getGroups);
router.get('/create', groupsController.createGroup);
router.get('/update/:id', groupsController.updateGroup);
router.get('/delete/:id', groupsController.deleteGroup);

export default router;
