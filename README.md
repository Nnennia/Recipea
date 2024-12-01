Recipe Management API
Overview

This project provides an API for managing recipes and chefs, featuring functionalities like user authentication, image uploads, image resizing, and CRUD operations for recipes. It uses technologies like Node.js, Express.js, MongoDB, Multer, and Sharp.

Features

    User Authentication: Supports signup and login for chefs.
    Image Upload and Resizing:
        Images are uploaded and resized to optimized dimensions.
        Original and resized images are stored in the uploads directory.
    Recipe Management:
        Add, retrieve, and query recipes.
        Pagination for fetching recipes.
    Error Handling: Centralized error handling middleware.

Requirements

    Node.js: v14 or later
    MongoDB
    Environment Variables:
        PORT: Port number for the server.
        JWT_SECRET: Secret key for JWT.

Setup

    Clone the repository:

git clone https://github.com/your-repo/Recipea.git
cd Recipea

Install dependencies:

npm install

Set up environment variables: Create a .env file:

PORT=3000
JWT_SECRET=your-secret-key
MONGO_URI=your-mongo-database-uri

Run the server:

    npm start

The server will be accessible at http://localhost:3000.
API Endpoints
Authentication
Signup

Method: POST
Endpoint: /auth
Description: Register a new chef.
Login

Method: POST
Endpoint: /auth
Description: Login and get a JWT token.
Recipes
Add Recipe

Method: POST
Endpoint: /recipes
Description: Add a new recipe (requires image).
Get Recipes

Method: GET
Endpoint: /recipes
Description: Fetch and query recipes.

Example Usage
Signup

Request:

POST /auth
{
"action": "signup",
"name": "Chef John",
"email": "chef.john@example.com",
"password": "securepassword"
}

Response:

{
"message": "Admin created Successfully"
}

Add Recipe

Request:

POST /recipes
{
"action": "addRecipe",
"name": "Chef John",
"title": "Spaghetti Bolognese",
"description": "A classic Italian pasta dish.",
"ingredients": ["pasta", "tomato sauce", "ground beef"],
"steps": ["Cook pasta", "Prepare sauce", "Combine pasta and sauce"]
}

Attach an image file in the form-data key recipeImage.

Response:

{
"message": "Recipe added successfully",
"recipe": { ... }
}

Error Handling

    400 Bad Request: Missing or invalid data.
    401 Unauthorized: Invalid credentials.
    500 Internal Server Error: Unexpected server-side issues.
