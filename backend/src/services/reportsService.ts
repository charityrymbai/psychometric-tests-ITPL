// Get reports by user_id
export const getReportsByUserId = async (userId: number) => {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute(
      `SELECT id, data, version, created_at FROM reports_generated WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    // Map each report to include required fields and isSingleOptionCorrect
    const reports = (rows as any[]).map((report) => {
      let parsedData;
      try {
        parsedData = typeof report.data === 'string' ? JSON.parse(report.data) : report.data;
      } catch (e) {
        parsedData = {};
      }

      // Calculate totalQuestions if it's 0 or missing (for backward compatibility)
      let totalQuestions = parsedData.totalQuestions;
      if (!totalQuestions && Array.isArray(parsedData.sections)) {
        totalQuestions = parsedData.sections.reduce((sum: number, section: any) => {
          if (Array.isArray(section.questions)) {
            return sum + section.questions.length;
          } else if (typeof section.totalQuestions === 'number') {
            return sum + section.totalQuestions;
          } else if (Array.isArray(section.tags)) {
            const tagCountSum = section.tags.reduce((tagSum: number, tag: any) => 
              tagSum + (typeof tag.tagCount === 'number' ? tag.tagCount : 0), 0);
            return sum + tagCountSum;
          }
          return sum;
        }, 0);
      }

      // Calculate totalScore (attempted questions) if it's 0 or missing (for backward compatibility)
      let totalScore = parsedData.totalScore;
      if (!totalScore && Array.isArray(parsedData.sections)) {
        totalScore = parsedData.sections.reduce((sum: number, section: any) => {
          if (section.sectionType === 'score' && typeof section.score === 'number') {
            return sum + section.score;
          } else if (Array.isArray(section.tags)) {
            const tagCountSum = section.tags.reduce((tagSum: number, tag: any) => 
              tagSum + (typeof tag.tagCount === 'number' ? tag.tagCount : 0), 0);
            return sum + tagCountSum;
          }
          return sum;
        }, 0);
      }

      return {
        id: report.id,
        testTitle: parsedData.testTitle,
        groupName: parsedData.groupName,
        completedAt: parsedData.completedAt,
        totalScore: totalScore,
        totalQuestions: totalQuestions,
        version: report.version,
        created_at: report.created_at,
        isSingleOptionCorrect: parsedData.isSingleOptionCorrect ?? null,
      };
    });
    return {
      success: true,
      message: "Reports retrieved successfully",
      data: reports,
    };
  } catch (error) {
    console.error("Error retrieving reports by userId:", error);
    return {
      success: false,
      message: "Failed to retrieve reports",
      error,
    };
  }
};
import dbPromise from '../config/db.js';
import { TestResult } from '../zod/reports.js';

export const createReport = async (data: TestResult, version: number = 0, user_id?: number) => {
  try {
    // Calculate totalQuestions from sections
    if (Array.isArray(data.sections)) {
      data.totalQuestions = data.sections.reduce((sum, section) => {
        if (Array.isArray((section as any).questions)) {
          return sum + (section as any).questions.length;
        } else if (typeof section.totalQuestions === 'number') {
          return sum + section.totalQuestions;
        } else if (Array.isArray(section.tags)) {
          // For tag-based sections, sum tagCount for each tag
          const tagCountSum = section.tags.reduce((tagSum, tag) => tagSum + (typeof tag.tagCount === 'number' ? tag.tagCount : 0), 0);
          return sum + tagCountSum;
        }
        return sum;
      }, 0);
    }

    // Calculate totalScore (attempted questions) from sections
    if (Array.isArray(data.sections)) {
      data.totalScore = data.sections.reduce((sum, section) => {
        if (section.sectionType === 'score' && typeof section.score === 'number') {
          // For score-based sections, use the score field
          return sum + section.score;
        } else if (Array.isArray(section.tags)) {
          // For tag-based sections, sum all tagCount values (represents answered questions)
          const tagCountSum = section.tags.reduce((tagSum, tag) => tagSum + (typeof tag.tagCount === 'number' ? tag.tagCount : 0), 0);
          return sum + tagCountSum;
        }
        return sum;
      }, 0);
    }

    const db = await dbPromise;
    // Always stringify data to ensure valid JSON
    const safeData = JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data);
    const [result] = await db.execute(
      `INSERT INTO reports_generated (data, version, user_id) VALUES (?, ?, ?)`,
      [safeData, version, user_id]
    );

    return {
      success: true,
      message: "Report created successfully",
      reportId: (result as any).insertId,
    };
  } catch (error) {
    console.error("Error inserting report:", error);
    return {
      success: false,
      message: "Failed to create report",
      error,
    };
  }
};

export const getReport = async (id: number) => {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute(
      `SELECT * FROM reports_generated WHERE id = ?`,
      [id]
    );

    const reports = rows as any[];
    if (reports.length === 0) {
      return {
        success: false,
        message: "Report not found",
        data: null,
      };
    }

    const report = reports[0];
    let parsedData;
    try {
      parsedData = typeof report.data === 'string' ? JSON.parse(report.data) : report.data;
    } catch (parseError) {
      console.error("Error parsing report data:", parseError);
      return {
        success: false,
        message: "Failed to parse report data",
        error: parseError,
      };
    }
    return {
      success: true,
      message: "Report retrieved successfully",
      data: {
        id: report.id,
        data: parsedData,
        version: report.version,
        createdAt: report.created_at || report.createdAt,
      },
    };
  } catch (error) {
    console.error("Error retrieving report:", error);
    return {
      success: false,
      message: "Failed to retrieve report",
      error,
    };
  }
};

export const getAllReports = async (limit: number = 50, offset: number = 0) => {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute(
      `SELECT id, 
              JSON_EXTRACT(data, '$.testTitle') as testTitle, 
              JSON_EXTRACT(data, '$.groupName') as groupName,
              JSON_EXTRACT(data, '$.completedAt') as completedAt,
              JSON_EXTRACT(data, '$.totalScore') as totalScore,
              JSON_EXTRACT(data, '$.totalQuestions') as totalQuestions,
              version, created_at
      FROM reports_generated 
      ORDER BY created_at DESC`
    );

    return {
      success: true,
      message: "Reports retrieved successfully",
      data: rows,
    };
  } catch (error) {
    console.error("Error retrieving reports:", error);
    return {
      success: false,
      message: "Failed to retrieve reports",
      error,
    };
  }
};

export const getReportsByTestId = async (testId: string) => {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute(
      `SELECT * FROM reports_generated 
       WHERE JSON_EXTRACT(data, '$.testId') = ?
       ORDER BY created_at DESC`,
      [testId]
    );

    const reports = (rows as any[]).map(report => ({
      id: report.id,
      data: JSON.parse(report.data),
      version: report.version,
      createdAt: report.created_at || report.createdAt,
    }));

    return {
      success: true,
      message: "Reports retrieved successfully",
      data: reports,
    };
  } catch (error) {
    console.error("Error retrieving reports by testId:", error);
    return {
      success: false,
      message: "Failed to retrieve reports",
      error,
    };
  }
};

export const deleteReport = async (id: number) => {
  try {
    const db = await dbPromise;
    const [result] = await db.execute(
      `DELETE FROM reports_generated WHERE id = ?`,
      [id]
    );

    const affectedRows = (result as any).affectedRows;
    if (affectedRows === 0) {
      return {
        success: false,
        message: "Report not found",
      };
    }

    return {
      success: true,
      message: "Report deleted successfully",
      affectedRows,
    };
  } catch (error) {
    console.error("Error deleting report:", error);
    return {
      success: false,
      message: "Failed to delete report",
      error,
    };
  }
};
