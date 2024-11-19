const express = require("express");
const { recipe, upload } = require("../handler/recipe.handler"); // Import the handler and multer
const recipeRouter = express.Router();

// Route for adding a recipe with an image (POST request)
recipeRouter.post("/recipe", upload.single("recipeImage"), recipe);

// Route for getting recipes (GET request)
recipeRouter.route("/recipe").get(recipe);

module.exports = recipeRouter;
