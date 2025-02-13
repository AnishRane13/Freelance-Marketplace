const { getUserById } = require("../../../models/users/getUserById");

const getUserByIdController = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: "User ID is required" 
            });
        }

        const user = await getUserById(userId);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: "User not found" 
            });
        }

        // Remove sensitive information
        delete user.password;

        res.json({ 
            success: true,
            user
        });

    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal Server Error" 
        });
    }
};

module.exports = { getUserByIdController };