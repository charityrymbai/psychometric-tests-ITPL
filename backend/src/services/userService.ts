// Table: reports_generated
// Columns:
// id int AI PK 
// data json 
// version decimal(5,2) 
// created_at datetime 
// user_id int

import dbPromise from "../config/db.js";

export const createUser = async (userId: string | number, userData: any) => {
  try {
    // Parse the userId to make sure it's a number
    let user_id: number;
    
    if (userId) {
      // Try to convert the input to a number
      const parsedId = Number(userId);
      if (!isNaN(parsedId)) {
        user_id = parsedId;
      } else {
        // If conversion fails, generate a random ID
        user_id = Math.floor(1000 + Math.random() * 9000);
        console.log(`Provided userId '${userId}' is not a valid number, using generated ID: ${user_id}`);
      }
    } else {
      // If no ID provided, generate one
      user_id = Math.floor(1000 + Math.random() * 9000);
    }

    const db = await dbPromise;
    await db.execute(
      "INSERT INTO users (user_id, name, class) VALUES (?, ?, ?)",
      [user_id, userData.name, userData.class]
    );
    return user_id;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
    
};

export const getUser = async (userId: string) => {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute("SELECT * FROM users WHERE user_id = ?", [userId]);
    if (rows.length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return rows[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
};

export const updateUser = async (userId: string, userData: any) => {
  try {
    const db = await dbPromise;
    const [result] = await db.execute(
      "UPDATE users SET name = ?, class = ? WHERE user_id = ?",
      [userData.name, userData.class, userId]
    );
    if (result.affectedRows === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return getUser(userId);
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const db = await dbPromise;
    const [result] = await db.execute("DELETE FROM users WHERE user_id = ?", [userId]);
    if (result.affectedRows === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const db = await dbPromise;
    const [rows] = await db.execute("SELECT * FROM users");
    return rows;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};



