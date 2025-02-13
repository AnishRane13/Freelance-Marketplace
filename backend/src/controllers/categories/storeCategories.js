const pool = require("../../../db/db");

const storeCategoriesController = async (req, res) => {
  try {
    console.log("=== Store Categories Controller Started ===");
    console.log("Request Body:", req.body);
    
    const { id, type, categories } = req.body;
    console.log("Destructured values:", { id, type, categories });

    // Input validation
    if (!id || !type || !categories || !Array.isArray(categories)) {
      console.log("Input validation failed:", { id, type, categories });
      return res.status(400).json({ success: false, error: "Invalid input" });
    }
    console.log("Input validation passed");

    // Extract just the category IDs from the incoming objects
    const categoryIds = categories.map(category => category.id);
    console.log("Extracted category IDs:", categoryIds);

    // Verify these categories exist in the database
    const verifyQuery = `
      SELECT category_id 
      FROM categories 
      WHERE category_id = ANY($1::integer[])
    `;
    console.log("Verification query:", verifyQuery);
    console.log("Category IDs to verify:", categoryIds);
    
    const { rows: verifiedCategories } = await pool.query(verifyQuery, [categoryIds]);
    console.log("Verified categories:", verifiedCategories);

    if (verifiedCategories.length !== categoryIds.length) {
      console.log("Some categories not found in database");
      return res.status(400).json({ 
        success: false, 
        error: "One or more invalid category IDs" 
      });
    }

    // Update users table with verified category IDs
    const updateQuery = `
      UPDATE users 
      SET categories = $1 
      WHERE user_id = $2 
      RETURNING user_id, categories
    `;
    console.log("Update query:", updateQuery);
    console.log("Update parameters:", { categoryIds, id });

    const { rows } = await pool.query(updateQuery, [categoryIds, id]);
    console.log("Update result rows:", rows);

    if (rows.length === 0) {
      console.log("No user found with ID:", id);
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const response = { 
      success: true, 
      message: "Categories saved successfully",
      categories: categoryIds
    };
    console.log("Sending successful response:", response);
    console.log("=== Store Categories Controller Completed ===");
    
    res.json(response);

  } catch (error) {
    console.error("=== Store Categories Controller Error ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { storeCategoriesController };