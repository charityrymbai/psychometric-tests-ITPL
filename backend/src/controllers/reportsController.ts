// Get reports by user_id
export const getReportsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        message: 'Invalid user ID',
      });
    }
    const response = await reportsService.getReportsByUserId(userId);
    if (response.success) {
      res.json({
        message: response.message,
        reports: response.data,
      });
    } else {
      res.status(500).json({
        message: response.message,
        error: response.error,
      });
    }
  } catch (error) {
    console.error('Error in getReportsByUserId controller:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
import * as reportsService from '../services/reportsService.js';
import { CreateReportSchema } from '../zod/reports.js';
import { Request, Response } from 'express';

export const createReport = async (req: Request, res: Response) => {
  try {
    const validation = CreateReportSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: validation.error.issues,
      });
    }

    const { data, version, user_id } = validation.data;
    const response = await reportsService.createReport(data, version, user_id);

    if (response.success) {
      res.status(201).json({
        message: response.message,
        reportId: response.reportId,
      });
    } else {
      res.status(500).json({
        message: response.message,
        error: response.error,
      });
    }
  } catch (error) {
    console.error('Error in createReport controller:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        message: 'Invalid report ID',
      });
    }

    const response = await reportsService.getReport(id);

    if (response.success) {
      res.json({
        message: response.message,
        report: response.data,
      });
    } else {
      const statusCode = response.message === "Report not found" ? 404 : 500;
      res.status(statusCode).json({
        message: response.message,
        error: response.error,
      });
    }
  } catch (error) {
    console.error('Error in getReport controller:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        message: 'Limit must be between 1 and 100',
      });
    }

    if (offset < 0) {
      return res.status(400).json({
        message: 'Offset must be non-negative',
      });
    }

    const response = await reportsService.getAllReports(limit, offset);

    if (response.success) {
      res.json({
        message: response.message,
        reports: response.data,
        pagination: {
          limit,
          offset,
        },
      });
    } else {
      res.status(500).json({
        message: response.message,
        error: response.error,
      });
    }
  } catch (error) {
    console.error('Error in getAllReports controller:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getReportsByTestId = async (req: Request, res: Response) => {
  try {
    const testId = req.params.testId;
    
    if (!testId) {
      return res.status(400).json({
        message: 'Test ID is required',
      });
    }

    const response = await reportsService.getReportsByTestId(testId);

    if (response.success) {
      res.json({
        message: response.message,
        reports: response.data,
      });
    } else {
      res.status(500).json({
        message: response.message,
        error: response.error,
      });
    }
  } catch (error) {
    console.error('Error in getReportsByTestId controller:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        message: 'Invalid report ID',
      });
    }

    const response = await reportsService.deleteReport(id);

    if (response.success) {
      res.json({
        message: response.message,
        affectedRows: response.affectedRows,
      });
    } else {
      const statusCode = response.message === "Report not found" ? 404 : 500;
      res.status(statusCode).json({
        message: response.message,
        error: response.error,
      });
    }
  } catch (error) {
    console.error('Error in deleteReport controller:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
