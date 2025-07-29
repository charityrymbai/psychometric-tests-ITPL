import { Router } from "express";
import * as commonRouter from "../controllers/commonControllers.js"

const router = Router();

router.get('/all', commonRouter.getAllGroupsWithSections);

export default router;