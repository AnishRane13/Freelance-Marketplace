import pool from "../../../db/db";

const storeCategories = async (req, res) => {
    try {
      const { id, type, categories } = req.body;
  
      if (!id || !type || !categories || !Array.isArray(categories)) {
        return res.status(400).json({ success: false, error: "Invalid input" });
      }
  
      const tableName = type === "user" ? "users" : "company";
      const query = `UPDATE ${tableName} SET categories = $1 WHERE ${type}_id = $2`;
  
      await pool.query(query, [JSON.stringify(categories), id]);
  
      res.json({ success: true, message: "Categories saved successfully" });
    } catch (error) {
      console.error("Error saving categories:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
  
  module.exports = { storeCategories };
  