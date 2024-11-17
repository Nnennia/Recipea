const Chef = require("../models/chef-recipe");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const auth = async (req, res) => {
	try {
		const { action } = req.body;
		if (action === "signup") {
			const { name, password, email } = req.body;
			const existingChef = await Chef.findOne({ name });
			if (existingChef) {
				return res.status(400).json({ error: "Chef already exists" });
			}
			function validEmail(email) {
				let re = /\S+@\S+\.S+/;
				return re.test(email);
			}
			if (!validEmail) {
				return res.status(400).json({ error: "Invalid Email Address" });
			}
			const hashedPassword = await bcrypt.hash(password, 10);
			const chef = await Chef.create({
				name,
				password: hashedPassword,
				email,
			});
			return res.status(201).json({ message: "Admin created Successfully" });
		} else if (action === "login") {
			const { name, password } = req.body;
			const chef = await Chef.findOne({ name });
			const validPassword = await bcrypt.compare(password, name.password);
			if (!validPassword || !chef) {
				return res
					.status(401)
					.json({ error: "Incorrect username or password" });
			}
			const token = jwt.sign({ name: chef.name }, process.env.JWT_SECRET, {
				expiresIn: "1h",
			});
			return res.status(200).json({ message: "Login successful", token });
		} else {
			return res.status(400).json({ error: "Invalid Action" });
		}
	} catch (error) {
		console.error("Error: error");
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
module.exports = auth;
