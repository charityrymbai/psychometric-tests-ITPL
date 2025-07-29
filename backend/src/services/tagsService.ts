import dbPromise from "../config/db.js";

export const getTags = async () => {
  const db = await dbPromise;
  const [rows] = await db.execute("SELECT * FROM tag_settings");
  return rows;
};

import { ResultSetHeader } from "mysql2/promise";

export const createTag = async (tagData) => {
  const db = await dbPromise;
  const [result] = await db.execute<ResultSetHeader>("INSERT INTO tag_settings (name, description, section_id) VALUES (?, ?, ?)", [tagData.name, tagData.description, tagData.section_id]);
  return { id: (result as ResultSetHeader).insertId, ...tagData };
};

export const updateTag = async (id, tagData) => {
  const db = await dbPromise;
  await db.execute("UPDATE tag_settings SET name = ? WHERE id = ?", [tagData.name, id]);
  return { id, ...tagData };
};

export const deleteTag = async (id) => {
  const db = await dbPromise;
  const [result] = await db.execute<ResultSetHeader>("DELETE FROM tag_settings WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    throw new Error("Tag not found");
  }
};
