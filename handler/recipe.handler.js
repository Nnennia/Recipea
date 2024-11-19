const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const Chef = require("../models/chef-recipe");

// Configure Multer for file upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = path.join(__dirname, "../uploads/originals");
		fsExtra.ensureDirSync(uploadPath); // Ensure directory exists
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const timestamp = Date.now();
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, `${timestamp}-${path.basename(file.originalname, ext)}${ext}`);
	},
});

const upload = multer({ storage });

// Resize Image using sharp and fs.readFile/fs.writeFile
const resizeImage = async (inputPath, outputPath, width, height) => {
	try {
		const inputBuffer = await fs.promises.readFile(inputPath); // Read file buffer
		const outputBuffer = await sharp(inputBuffer)
			.resize(width, height)
			.toFormat("jpeg")
			.jpeg({ quality: 85 })
			.toBuffer(); // Process image into a buffer

		// Write the resized image buffer to the output path
		await fs.promises.writeFile(outputPath, outputBuffer);
	} catch (error) {
		console.error("Error resizing image:", error);
		throw error;
	}
};

// Ensure the resized folder exists
const ensureResizedFolder = () => {
	const folderPath = path.join(__dirname, "../uploads/resized");
	fsExtra.ensureDirSync(folderPath);
};

// Recipe handler
const recipe = async (req, res) => {
	try {
		const { action } = req.body;

		if (action === "addRecipe") {
			const {
				name,
				title,
				publicationDate,
				labels,
				description,
				ingredients,
				steps,
			} = req.body;

			const recipeImage = req.file;

			if (
				!name ||
				!title ||
				!description ||
				ingredients.length === 0 ||
				steps.length === 0
			) {
				return res.status(400).json({ error: "All fields are required" });
			}

			if (!recipeImage) {
				return res.status(400).json({ error: "Recipe image is required." });
			}

			ensureResizedFolder(); // Ensure resized folder exists
			const resizedFolder = path.join(__dirname, "../uploads/resized");
			const uniqueFileName = `${Date.now()}-${path.basename(
				recipeImage.filename,
				path.extname(recipeImage.filename)
			)}.jpeg`;
			const outputImagePath = path.join(resizedFolder, uniqueFileName);

			// Resize and save image
			await resizeImage(recipeImage.path, outputImagePath, 800, 600);

			// Optionally, remove the original image if not needed anymore
			await fs.promises.unlink(recipeImage.path);

			const chef = await Chef.findOne({ name });
			if (!chef) {
				return res.status(404).json({ error: "Chef not found" });
			}

			const newRecipe = {
				title,
				publicationDate: publicationDate || new Date(),
				labels: labels || [],
				description,
				ingredients,
				steps,
				recipeImage: outputImagePath, // Store path of the resized image
			};

			chef.recipes.push(newRecipe);
			await chef.save();

			return res
				.status(201)
				.json({ message: "Recipe added successfully", recipe: newRecipe });
		} else if (action === "getRecipe") {
			const { page = 1, limit = 10, title, labels, ingredients } = req.query;

			const query = {};
			if (title) query["recipes.title"] = { $regex: title, $options: "i" };
			if (labels) query["recipes.labels"] = { $in: labels.split(",") };
			if (ingredients)
				query["recipes.ingredients"] = { $in: ingredients.split(",") };

			const chefs = await Chef.aggregate([
				{ $unwind: "$recipes" },
				{ $match: query },
				{
					$group: {
						_id: "$_id",
						name: { $first: "$name" },
						email: { $first: "$email" },
						recipes: { $push: "$recipes" },
					},
				},
				{ $skip: (page - 1) * limit },
				{ $limit: parseInt(limit) },
			]);

			const totalRecipes = await Chef.aggregate([
				{ $unwind: "$recipes" },
				{ $match: query },
				{ $count: "total" },
			]);

			const total = totalRecipes.length > 0 ? totalRecipes[0].total : 0;
			const totalPages = Math.ceil(total / limit);
			const isLastPage = page * limit >= total;

			return res.status(200).json({
				message: "Recipes fetched successfully",
				data: chefs,
				pagination: {
					total,
					page: parseInt(page),
					limit: parseInt(limit),
					totalPages,
					isLastPage,
				},
			});
		} else {
			return res.status(400).json({ error: `Invalid action:${action}` });
		}
	} catch (error) {
		console.error("Error in recipeController:", error.message);
		return res.status(500).json({ error: "An internal server error occurred" });
	}
};

module.exports = { recipe, upload };
