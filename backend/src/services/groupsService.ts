import dbPromise from '../config/db.js';

export const getAllGroups = async () => {
  const db = await dbPromise;
  const [rows] = await db.execute(`
    SELECT 
      g.*, 
      COUNT(DISTINCT s.id) AS sectionCount
    FROM \`groups\` g
    LEFT JOIN \`section_settings\` s ON g.id = s.group_id
    GROUP BY g.id
  `);
  return rows as any[];
};




export const createGroupInDB = async (
  name: string,
  description: string,
  startingClass: number,
  endingClass: number
) => {
  try {
    const db = await dbPromise;
    const [result] = await db.execute(
      `INSERT INTO \`groups\` (name, description, starting_class, ending_class)
       VALUES (?, ?, ?, ?)`,
      [name, description, startingClass, endingClass]
    );

    return {
      success: true,
      message: "Group created successfully",
      groupId: (result as any).insertId,
    };
  } catch (error) {
    console.error("Error inserting group:", error);
    return {
      success: false,
      message: "Failed to create group",
      error,
    };
  }
};


export const updateGroup = async (id: number, groupData: any) => {
  try {
    const db = await dbPromise;

    const { name, description, startingClass, endingClass } = groupData;

    const [result] = await db.execute(
      `UPDATE \`groups\`
       SET name = ?, description = ?, starting_class = ?, ending_class = ?
       WHERE id = ?`,
      [name, description, startingClass, endingClass, id]
    );

    return {
      success: true,
      message: "Group updated successfully",
      affectedRows: (result as any).affectedRows,
    };
  } catch (error) {
    console.error("Error updating group:", error);
    return {
      success: false,
      message: "Failed to update group",
      error,
    };
  }
};

export const deleteGroup = async (id: number) => {
  try {
    const db = await dbPromise;
    
    // 1. First, get all sections belonging to this group
    const [sections] = await db.execute(
      `SELECT id FROM section_settings WHERE group_id = ?`,
      [id]
    );
    
    // 2. For each section, delete associated data
    for (const section of sections as any[]) {
      // Delete tags for this section
      await db.execute(
        `DELETE FROM tags WHERE section_id = ?`,
        [section.id]
      );
      
      // Delete questions for this section
      await db.execute(
        `DELETE FROM questions WHERE section_id = ?`,
        [section.id]
      );
    }
    
    // 3. Delete all sections belonging to this group
    await db.execute(
      `DELETE FROM section_settings WHERE group_id = ?`,
      [id]
    );
    
    // 4. Finally, delete the group itself
    const [result] = await db.execute(
      `DELETE FROM \`groups\` WHERE id = ?`,
      [id]
    );

    return {
      success: true,
      message: "Group and all associated data deleted successfully",
      affectedRows: (result as any).affectedRows,
    };
  } catch (error) {
    console.error("Error deleting group:", error);
    return {
      success: false,
      message: "Failed to delete group",
      error,
    };
  }
};
