const pool = require("../../../db/db");

const getCategoriesController = async (req, res) => {
  try {
    // Query to fetch all categories ordered by name
    const query = `
      SELECT 
        category_id,
        name
      FROM categories 
      ORDER BY name ASC
    `;
    
    const { rows } = await pool.query(query);

    // Transform the data to match the frontend expectations
    const categories = rows.map(row => ({
      id: row.category_id,
      name: row.name
    }));

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories"
    });
  }
};

module.exports = { getCategoriesController };