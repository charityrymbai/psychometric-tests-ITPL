import dbPromise from "../config/db.js";

export const getSections = async () => {
  const db = await dbPromise;
  const [rows] = await db.execute("SELECT * FROM section_settings");
  return rows;
};

export const createSection = async (groupId, sectionData) => {
  const db = await dbPromise;
  const [result] = await db.execute("INSERT INTO section_settings (group_id, name, description) VALUES (?, ?, ?)", [groupId, sectionData.name, sectionData.description]);
  return { id: result.insertId, ...sectionData };
};

export const updateSection = async (groupId, sectionId, sectionData) => {
  const db = await dbPromise;
  await db.execute("UPDATE section_settings SET name = ?, description = ? WHERE id = ? AND group_id = ?", [sectionData.name, sectionData.description, sectionId, groupId]);
  return { id: sectionId, ...sectionData };
};

export const deleteSection = async (groupId, sectionId) => {
  const db = await dbPromise;
  const [result] = await db.execute("DELETE FROM section_settings WHERE id = ? AND group_id = ?", [sectionId, groupId]);
  if (result.affectedRows === 0) {
    throw new Error("Section not found");
  }
};
