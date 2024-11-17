const Chef = require("../models/chef-recipe");
const sharp = require("sharp");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up Multer storage and file filter for image upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/"); // Folder to save uploaded images
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
	},
});

const fileFilter = (req, file, cb) => {
	// Only allow image files
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type, only images are allowed."), false);
	}
};

const upload = multer({ storage, fileFilter });

// Image resizing function using Sharp
const resizeImage = (inputPath, outputPath, width, height) => {
	return sharp(inputPath)
		.resize(width, height) // Resize image
		.toFile(outputPath); // Save resized image
};

// Recipe controller with image handling
const recipe = async (req, res) => {
	try {
		const { action } = req.body;

		if (action === "addRecipe") {
			// Extract data from request
			const {
				name,
				title,
				publicationDate,
				labels,
				description,
				ingredients,
				steps,
			} = req.body;
			const recipeImage = req.file; // Image uploaded using Multer

			// Validate required fields
			if (!name || !title || !description || !ingredients || !steps) {
				return res.status(400).json({ error: "All fields are required" });
			}

			// Check if the image was uploaded
			if (!recipeImage) {
				return res.status(400).json({ error: "Recipe image is required" });
			}

			// Validate that the uploaded file is an image
			if (!recipeImage.mimetype.startsWith("image/")) {
				return res
					.status(400)
					.json({ error: "Invalid file type, only images are allowed." });
			}

			// Resize the uploaded image to a standard size (e.g., 800x600)
			const outputImagePath = path.join(
				"uploads",
				"resized",
				recipeImage.filename
			);
			await resizeImage(recipeImage.path, outputImagePath, 800, 600);

			// Optionally, you can remove the original image after resizing (optional)
			fs.unlinkSync(recipeImage.path);

			// Find the chef by ID
			const chef = await Chef.findOne(name);
			if (!chef) {
				return res.status(404).json({ error: "Chef not found" });
			}

			// Add the new recipe to the chef's recipe list
			const newRecipe = {
				title,
				publicationDate: publicationDate || new Date(),
				labels: labels || [],
				description,
				ingredients,
				steps,
				recipeImage: outputImagePath, // Store the path to the resized image
			};

			chef.recipes.push(newRecipe); // Add the recipe to the chef's recipes array
			await chef.save(); // Save the updated chef document

			return res
				.status(201)
				.json({ message: "Recipe added successfully", recipe: newRecipe });
		} else {
			return res.status(400).json({ error: "Invalid action" });
		}
	} catch (error) {
		console.error("Error in recipeController:", error);
		return res.status(500).json({ error: "An internal server error occurred" });
	}
};

module.exports = recipe;
