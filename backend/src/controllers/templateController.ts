import { Request, Response } from 'express';
import { TemplateRenderer } from '../services/templateService.js';
import * as reportsService from '../services/reportsService.js';

export const renderReport = async (req: Request, res: Response) => {
  try {
    const { reportId, templateVersion } = req.params;
    const id = parseInt(reportId);
    
    if (isNaN(id)) {
      return res.status(400).json({
        message: 'Invalid report ID',
      });
    }

    // Get the report data
    const reportResponse = await reportsService.getReport(id);
    
    if (!reportResponse.success) {
      const statusCode = reportResponse.message === "Report not found" ? 404 : 500;
      return res.status(statusCode).json({
        message: reportResponse.message,
        error: reportResponse.error,
      });
    }

    const version = templateVersion ? parseInt(templateVersion) : reportResponse.data!.version;
    
    if (isNaN(version)) {
      return res.status(400).json({
        message: 'Invalid template version',
      });
    }

    // Render the template
    const renderedHtml = await TemplateRenderer.renderTemplate(version, reportResponse.data!.data);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `inline; filename="${reportResponse.data!.data.testTitle.replace(/\s+/g, '-')}-results.html"`);
    res.send(renderedHtml);

  } catch (error) {
    console.error('Error rendering report:', error);
    res.status(500).json({
      message: 'Failed to render report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const downloadReport = async (req: Request, res: Response) => {
  try {
    const { reportId, templateVersion } = req.params;
    const id = parseInt(reportId);
    
    if (isNaN(id)) {
      return res.status(400).json({
        message: 'Invalid report ID',
      });
    }

    // Get the report data
    const reportResponse = await reportsService.getReport(id);
    
    if (!reportResponse.success) {
      const statusCode = reportResponse.message === "Report not found" ? 404 : 500;
      return res.status(statusCode).json({
        message: reportResponse.message,
        error: reportResponse.error,
      });
    }

    const version = templateVersion ? parseInt(templateVersion) : reportResponse.data!.version;
    
    if (isNaN(version)) {
      return res.status(400).json({
        message: 'Invalid template version',
      });
    }

    // Render the template
    const renderedHtml = await TemplateRenderer.renderTemplate(version, reportResponse.data!.data);

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${reportResponse.data!.data.testTitle.replace(/\s+/g, '-')}-results.html"`);
    res.send(renderedHtml);

  } catch (error) {
    console.error('Error downloading report:', error);
    res.status(500).json({
      message: 'Failed to download report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getTemplateVersions = async (req: Request, res: Response) => {
  try {
    const versions = await TemplateRenderer.getAllVersions();
    const latestVersion = await TemplateRenderer.getLatestVersion();

    res.json({
      message: 'Template versions retrieved successfully',
      versions,
      latestVersion,
    });
  } catch (error) {
    console.error('Error getting template versions:', error);
    res.status(500).json({
      message: 'Failed to get template versions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
