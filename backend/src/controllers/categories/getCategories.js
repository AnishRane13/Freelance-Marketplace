const getCategoriesController = (req, res) => {
    const categories = ["Photography", "Coding", "Sports", "Fashion", "Beauty", "Restaurant"];
    res.json({ success: true, categories });
  };
  
  module.exports = { getCategoriesController };
  