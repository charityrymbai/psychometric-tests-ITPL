
import { Router } from "express";
import * as reportsController from "../controllers/reportsController.js";

const router = Router();

// Get reports by user ID
router.get('/user/:userId', reportsController.getReportsByUserId);

// Create a new report
router.post('/create', reportsController.createReport);

// Get all reports with pagination
router.get('/getAll', reportsController.getAllReports);

// Get reports by test ID (more specific route first)
router.get('/test/:testId', reportsController.getReportsByTestId);

// Get a specific report by ID
router.get('/:id', reportsController.getReport);

// Delete a report
router.delete('/delete/:id', reportsController.deleteReport);

export default router;
