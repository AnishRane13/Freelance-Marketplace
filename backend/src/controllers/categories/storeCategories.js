const pool = require("../../../db/db");

const storeCategoriesController = async (req, res) => {
  try {
    const { id, type, categories } = req.body;

    if (!id || !type || !categories || !Array.isArray(categories)) {
      return res.status(400).json({ success: false, error: "Invalid input" });
    }

    // Convert category names to IDs
    const categoryQuery = `
      SELECT category_id 
      FROM categories 
      WHERE name = ANY($1::varchar[])
    `;
    
    const { rows: categoryRows } = await pool.query(categoryQuery, [categories]);
    const categoryIds = categoryRows.map(row => row.category_id);

    // Update the users table with category IDs
    const updateQuery = `
      UPDATE users 
      SET categories = $1 
      WHERE user_id = $2 
      RETURNING user_id, categories
    `;

    const { rows } = await pool.query(updateQuery, [categoryIds, id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ 
      success: true, 
      message: "Categories saved successfully",
      categories: categoryIds
    });

  } catch (error) {
    console.error("Error saving categories:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { storeCategoriesController };