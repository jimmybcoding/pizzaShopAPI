Node.js Pizza Order API

This is a Node.js-based API to manage pizza orders. It allows users to place, modify, retrieve, delete, and mark orders as complete. Built using Express, this API supports various pizza sizes, toppings, and quantities. Orders are stored in memory and prices are calculated based on selected size and toppings.

Features
Place a new pizza order
List all orders
Retrieve a specific order by ID
Modify an existing order
Delete an order
Mark an order as complete and calculate the final price

Prerequisites
Ensure the following are installed:

Node.js (version 14 or higher)

Clone the repository and navigate into the project folder:

git clone https://github.com/jimmybcoding/pizzaShopAPI.git

cd pizzaShopAPI

Install Dependencies
Run the following command to install the necessary dependencies:
npm install

Running the API
To start the API locally, run the following:

npm start
This will start the server on http://localhost:3000.

Development Mode
For development with automatic reloading, use nodemon:

npm run dev



