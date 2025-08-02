import dbPromise from "../config/db.js";
import { ResultSetHeader } from "mysql2/promise";

interface TagData {
  name: string;
  description: string;
  section_id: number;
}

export const getTags = async () => {
  const db = await dbPromise;
  const [rows] = await db.execute("SELECT * FROM tag_settings");
  return rows;
};

export const getTagsBySection = async (sectionId: string) => {
  const db = await dbPromise;
  const [rows] = await db.execute("SELECT * FROM tag_settings WHERE section_id = ?", [sectionId]);
  return rows;
};

export const createTag = async (tagData: TagData) => {
  const db = await dbPromise;
  const [result] = await db.execute<ResultSetHeader>("INSERT INTO tag_settings (name, description, section_id) VALUES (?, ?, ?)", [tagData.name, tagData.description, tagData.section_id]);
  return { id: (result as ResultSetHeader).insertId, ...tagData };
};

export const updateTag = async (id: string | number, tagData: Partial<TagData>) => {
  const db = await dbPromise;
  await db.execute("UPDATE tag_settings SET name = ? WHERE id = ?", [tagData.name, id]);
  return { id, ...tagData };
};

export const deleteTag = async (id: string | number) => {
  const db = await dbPromise;
  const [result] = await db.execute<ResultSetHeader>("DELETE FROM tag_settings WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    throw new Error("Tag not found");
  }
};

export const deleteTagsBySection = async (sectionId: number) => {
  const db = await dbPromise;
  const [result] = await db.execute<ResultSetHeader>("DELETE FROM tag_settings WHERE section_id = ?", [sectionId]);
  return result.affectedRows;
};

export const createMultipleTags = async (tags: { name: string; description: string; section_id: number }[]) => {
  const db = await dbPromise;
  const tagValues = tags.map(tag => [tag.name, tag.description, tag.section_id]);
  const [result] = await db.query<ResultSetHeader>("INSERT INTO tag_settings (name, description, section_id) VALUES ?", [tagValues]);
  return result.affectedRows;
}