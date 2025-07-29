
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

export const getQuestionsBySection = async (sectionId: string) => {
  const db = await dbPromise;
  const [rows] = await db.execute('SELECT * FROM questions WHERE section_id = ?', [sectionId]);
  return rows as any[];
};

// Table: questions
// Columns:
// id int AI PK 
// text varchar(200) 
// options json 
// correct_option tinyint(1) 
// section_id int 
// group_id int

export const createQuestion = async (questionData, sectionId) => {
  const {
    text, options,
    correct_option
   } = questionData;

  if (!text || !sectionId || correct_option === undefined) {
    throw new Error('Text, sectionId, and correct_option are required to create a question');
  }

  const db = dbPromise;
  return db.then(async (db) => {
    const [result] = await db.execute(
      'INSERT INTO questions (text, options, section_id, correct_option) VALUES (?, ?, ?, ?)',
      [text, JSON.stringify(options || []), sectionId, correct_option]
    );
    return {
      id: result.insertId,
      text,
      options: options || [],
      sectionId,
      correct_option
    };
  });
};

export const updateQuestion = async (id, questionData) => {
  console.log('Updating question with ID:', id, 'Data:', questionData);
  const db = dbPromise;
  return db.then(async (db) => {
    const [result] = await db.execute(
      'UPDATE questions SET text = ?, options = ?, correct_option = ? WHERE id = ?',
      [
        questionData.text,
        JSON.stringify(questionData.options || []),
        questionData.correct_option,
        id
      ]
    );
    return {
      id,
      ...questionData
    };
  });
};

export const deleteQuestion = async (id) => {
  const db = dbPromise;
  return db.then(async (db) => {
    await db.execute('DELETE FROM questions WHERE id = ?', [id]);
    return { id };
  });
};
