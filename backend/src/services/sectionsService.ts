import { array } from "zod/v4/classic/external.cjs";
import dbPromise from "../config/db.js";
import { createMultipleTags } from "./tagsService.js";

export const getAllSections = async () => {
  const db = await dbPromise;
  const [rows] = await db.execute("SELECT * FROM section_settings");
  return rows as any[];
};

export const createSection = async (groupId, sectionData) => {
  const db = await dbPromise;
  const [result] = await db.execute(
    "INSERT INTO section_settings (group_id, name, description, isSingleOptionCorrect) VALUES (?, ?, ?, ?)", 
    [groupId, sectionData.name, sectionData.description, sectionData.isSingleOptionCorrect?? true]);

  if (result.affectedRows === 0) {
    throw new Error("Failed to create section");
  }
  return { id: result.insertId, ...sectionData };
};

export const updateSection = async (groupId, sectionId, sectionData) => {

  console.log("Updating section:", groupId, sectionId, sectionData);
  const db = await dbPromise;
  // await db.execute("UPDATE section_settings SET name = ?, description = ? WHERE id = ? AND group_id = ?", [sectionData.name, sectionData.description, sectionId, groupId]);
  // run above query and also check rows affected
  const [result] = await db.execute(
    "UPDATE section_settings SET name = ?, description = ?, isSingleOptionCorrect = ? WHERE id = ? AND group_id = ?", 
    [sectionData.name, sectionData.description, sectionData.isSingleOptionCorrect ?? true, sectionId, groupId]
  );
  if (result.affectedRows === 0) {
    throw new Error("Section not found or no changes made");
  }
  
  return { id: sectionId, ...sectionData };
};

export const deleteSection = async (groupId, sectionId) => {
  const db = await dbPromise;
  const [result] = await db.execute("DELETE FROM section_settings WHERE id = ? AND group_id = ?", [sectionId, groupId]);
  if (result.affectedRows === 0) {
    throw new Error("Section not found");
  }
};


export const getSectionByGroupId = async (groupId: string) => {
  const db = await dbPromise;
  const [rows] = await db.execute(
    `
    SELECT 
      s.id AS sectionId,
      s.name AS sectionName,
      s.group_id AS groupId,
      COUNT(q.id) AS questionsCount,
      s.isSingleOptionCorrect
    FROM section_settings s
    LEFT JOIN questions q ON s.id = q.section_id
    WHERE s.group_id = ?
    GROUP BY s.id
    `,
    [groupId]
  );

  rows.forEach(section => {
    section.isSingleOptionCorrect = convertToBoolean(section.isSingleOptionCorrect);
  });

  return rows as any[];
};

export const convertToBoolean = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return Boolean(value);
};


