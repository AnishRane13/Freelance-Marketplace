const logoutController = (req, res) => {
    try {
      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error("Logout Error:", err);
          return res.status(500).json({ success: false, error: "Logout failed" });
        }
  
        res.clearCookie("connect.sid");
        res.json({ success: true, message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout Error:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
  
  module.exports = { logoutController };
  