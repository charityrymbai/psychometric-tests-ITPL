
import dbPromise from '../config/db.js';

export const getQuestions = async () => {
  const db = await dbPromise;
  const [rows] = await db.execute('SELECT * FROM questions');
  return rows as any[];
};

export const getQuestionsCountBySection = async () => {
  const db = await dbPromise;
  const [rows] = await db.execute('SELECT section_id, COUNT(*) as count FROM questions GROUP BY section_id');
  return rows as any[];
};

export const getQuestionsBySection = async (sectionId: string, maxQuestions?: number) => {
  const db = await dbPromise;

  try {
    const [rowsRaw] = await db.execute(
      `
      SELECT 
        q.*, 
        s.id AS sectionId,
        s.name AS sectionName,
        s.isSingleOptionCorrect,
        g.id AS groupId,
        g.name AS groupName,
        g.starting_class,
        g.ending_class
      FROM section_settings s
      INNER JOIN \`groups\` g ON s.group_id = g.id
      LEFT JOIN questions q ON q.section_id = s.id
      WHERE s.id = ?
      `,
      [sectionId]
    );

    const rows = rowsRaw as any[];
    if (rows.length === 0) return null;

    const [tagRowsRaw] = await db.execute(
      `SELECT id, name, description FROM tag_settings WHERE section_id = ?`,
      [sectionId]
    );

    const tagRows = tagRowsRaw as any[];

    const {
      groupId,
      groupName,
      sectionId: secId,
      sectionName,
      isSingleOptionCorrect,
      starting_class,
      ending_class,
    } = rows[0];

    let questions = rows
      .filter((q: any) => q.id !== null)
      .map((q: any) => ({
        id: q.id,
        text: q.text,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correct_option: q.correct_option,
        type: q.type || 'mcq',
      }));

    // Randomly select questions if maxQuestions is specified
    if (maxQuestions && questions.length > maxQuestions) {
      questions = questions
        .sort(() => 0.5 - Math.random()) // Shuffle array
        .slice(0, maxQuestions); // Take first maxQuestions
    }

    // ...existing code...

    return {
      groupId,
      groupName,
      sectionId: secId,
      sectionName,
      isSingleOptionCorrect: convertToBoolean(isSingleOptionCorrect),
      startingClass: starting_class,
      endingClass: ending_class,
      questions,
      tags: tagRows || [],
    };
  } catch (error: any) {
    throw new Error("Failed to fetch questions for section");
  }
};



// Helper to handle both Buffer and number
function convertToBoolean(value: unknown): boolean {
  if (Buffer.isBuffer(value)) return value[0] === 1;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'boolean') return value;
  return false; // Fallback
}





export const createQuestion = async (questionData: any, sectionId: any) => {
  const {
    text, options,
    correct_option
   } = questionData;


   // ...existing code...

  if (!text || !sectionId) {
    throw new Error('Text and sectionId are required to create a question');
  }
  
  // Process options to ensure tag_id is properly handled
  const processedOptions = Array.isArray(options) ? options.map((opt: any) => {
    // Ensure each option has text and tag_id properties
    const optionObj = typeof opt === 'object' ? opt : { text: String(opt) };
    
    // Ensure tag_id is properly formatted - should be a number or null
    if (optionObj.tag_id !== undefined && optionObj.tag_id !== null && typeof optionObj.tag_id !== 'number') {
      // Try to convert to number if possible
      const numVal = Number(optionObj.tag_id);
      optionObj.tag_id = !isNaN(numVal) ? numVal : null;
    }
    
    return optionObj;
  }) : [];

  // ...existing code...

  const db = dbPromise;
  return db.then(async (db) => {
    const [result] = await db.execute(
      'INSERT INTO questions (text, options, section_id, correct_option) VALUES (?, ?, ?, ?)',
      [text, JSON.stringify(processedOptions), sectionId, correct_option === undefined ? null : correct_option]
    );
    return {
      id: (result as any).insertId,
      text,
      options: processedOptions,
      sectionId,
      correct_option
    };
  });
};

export const updateQuestion = async (id: any, questionData: any) => {
  // ...existing code...
  
  // Process options to ensure tag_id is properly handled
  const processedOptions = Array.isArray(questionData.options) ? questionData.options.map((opt: any) => {
    // Ensure each option has text and tag_id properties
    const optionObj = typeof opt === 'object' ? opt : { text: String(opt) };
    
    // Ensure tag_id is properly formatted - should be a number or null
    if (optionObj.tag_id !== undefined && optionObj.tag_id !== null && typeof optionObj.tag_id !== 'number') {
      // Try to convert to number if possible
      const numVal = Number(optionObj.tag_id);
      optionObj.tag_id = !isNaN(numVal) ? numVal : null;
    }
    
    return optionObj;
  }) : [];

  // ...existing code...
  
  const db = dbPromise;
  return db.then(async (db) => {
    const [result] = await db.execute(
      'UPDATE questions SET text = ?, options = ?, correct_option = ? WHERE id = ?',
      [
        questionData.text,
        JSON.stringify(processedOptions),
        questionData.correct_option === undefined ? null : questionData.correct_option,
        id
      ]
    );
    return {
      id,
      ...questionData,
      options: processedOptions
    };
  });
};

export const deleteQuestion = async (id: any) => {
  const db = dbPromise;
  return db.then(async (db) => {
    await db.execute('DELETE FROM questions WHERE id = ?', [id]);
    return { id };
  });
};
