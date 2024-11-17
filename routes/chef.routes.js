const express = require("express");
const Chef = require("../handler/chef.auth.handler");
const chefRouter = express.Router();

chefRouter.route("/auth").post(Chef);

module.exports = chefRouter;
