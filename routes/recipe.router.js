const express = require("express");
const recipe = require("../handler/recipe.handler");
const recipeRouter = express.Router();

recipeRouter.route("/recipe").post(recipe);
recipeRouter.route("/recipe").get(recipe);
module.exports = recipeRouter;
