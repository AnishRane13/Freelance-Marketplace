const { registerCompany } = require ('../../../models/company/registerCompany')

const registerCompanyController = async (req, res) => {
    try {
        const { name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json("Name, Email and Password are required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email format" });
        }

        const newCompany = await registerCompany(name, email, password);

        delete newCompany.password;

        res.status(201).json(newCompany);
    } catch (error) {
        console.error(error.message);
        if (error.code === "23505") {
            // Unique violation
            res.status(409).json({ error: "Email already exists" });
          } else {
            res.status(500).json({ error: "Internal Server Error" });
          }
    }
}

module.exports = { registerCompanyController};