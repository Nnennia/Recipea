const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the 'uploads' directory exists before handling uploads
const ensureUploadsDirExists = () => {
	const uploadsDir = path.join(__dirname, "../uploads");

	if (!fs.existsSync(uploadsDir)) {
		// Create the 'uploads' directory if it doesn't exist
		fs.mkdirSync(uploadsDir, { recursive: true });
	}
};

// Set up Multer storage and file filter for image upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// Ensure the uploads directory exists before accepting the file
		ensureUploadsDirExists();
		cb(null, "uploads/"); // Folder to save uploaded images
	},
	filename: (req, file, cb) => {
		// Set a unique file name based on the current timestamp and file extension
		cb(null, Date.now() + path.extname(file.originalname));
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

// Multer setup with the storage and file filter
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB file size limit
	},
}).single("recipeImage");

module.exports = upload;
