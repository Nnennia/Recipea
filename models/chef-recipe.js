const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

// Recipe Sub-Schema
const recipeSchema = new Schema({
	recipeId: {
		type: Types.ObjectId, // Correct type for ObjectId
	},
	title: { type: String, required: true }, // Title of the recipe
	publicationDate: { type: Date, default: Date.now }, // Default to current date
	labels: [{ type: String }], // Array of labels/tags
	description: { type: String }, // Short description
	ingredients: [{ type: String, required: true }], // Array of ingredients
	steps: [{ type: String, required: true }], // Array of steps for preparation
	recipeImage: { type: String },
});

// Chef Schema
const chefSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true }, // Added `unique` for email
	password: { type: String, required: true },
	recipes: [recipeSchema], // Embed the recipe schema as an array
});

// Export the model
const Chef = model("Chef", chefSchema);

module.exports = Chef;
