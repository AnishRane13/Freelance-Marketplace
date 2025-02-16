const pool = require("../../../db/db");

const getCategoriesByIdController = async (req, res) => {
  const { id } = req.params; // Extract user_id from the request params

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "User ID is required"
    });
  }

  try {
    // Step 1: Get the category IDs from the users table
    const userQuery = `
      SELECT categories 
      FROM users 
      WHERE user_id = $1
    `;
    const userResult = await pool.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const categoryIds = userResult.rows[0].categories;

    if (!categoryIds || categoryIds.length === 0) {
      return res.json({
        success: true,
        categories: []
      });
    }

    // Step 2: Get the category details based on the category IDs
    const categoriesQuery = `
      SELECT 
        category_id, 
        name 
      FROM categories 
      WHERE category_id = ANY($1::int[])
      ORDER BY name ASC
    `;
    const categoriesResult = await pool.query(categoriesQuery, [categoryIds]);

    // Step 3: Transform the data
    const categories = categoriesResult.rows.map(row => ({
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

module.exports = { getCategoriesByIdController };
