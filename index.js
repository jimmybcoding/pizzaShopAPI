const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
const port = 3000;

app.use(express.json());

/* Store orders in memory */
let orders = [];

/* Restrict user inputs */
const possibleSizes = ["small", "medium", "large"];
const possibleToppings = ["pepperoni", "mushroom", "sausage", "ham", "pineapple", "bacon"];
const possibleQuantities = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; //Have to call the store first before you make a giant order

//Find order by ID middleware function
const findOrder = (req, res, next) => {
    const index = orders.findIndex(order => order.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: `Order with ID ${req.params.id} not found` });
    }
    
    req.order = orders[index]; // Attach found order to the request
    req.orderIndex = index; // Attach the index to the request for DELETE
    next();
};

/* Calculate Price middleware function */
const priceCalculation = (req, res, next) => {
    const { size, quantity, toppings } = req.order;
    
    if (!size || !quantity || !toppings) {
        return res.status(400).json({ error: 'Order is missing required fields: size, quantity, or toppings' });
    }
    // Calculate pie price
    let basePrice;
    if (size === "small") {
        basePrice = 5 * quantity;
    } else if (size === "medium") {
        basePrice = 8 * quantity;
    } else if (size === "large") {
        basePrice = 10 * quantity;
    } else {
        return res.status(400).json({ error: `Invalid size or quantity`})
    }
    // Calculate toppings price
    const toppingPrice = (1.50 * (toppings.length)) * quantity;
    
    // Calculate total price
    const price = basePrice + toppingPrice;
    req.order.price = price; // Attach price to the request
    next();
};

//POST for placing new pizza orders.
app.post('/orders', (req, res) => {
    try {
        const { size, toppings, quantity } = req.body;
        
        if (!possibleSizes.includes(size)) {
            return res.status(400).json({ error: `Invalid size, please choose between: ${possibleSizes.join(', ')}`})
        }
        if (!toppings.every(topping => possibleToppings.includes(topping))) {
            return res.status(400).json({ error: `Invalid toppings, please choose between: ${possibleToppings.join(', ')}` });
        }
        if(!possibleQuantities.includes(quantity)) {
            return res.status(400).json({ error: `Invalid quantity received, please choose between: ${possibleQuantities.join(', ')}. For larger orders call the store`})
        }

        const newOrder = {
            id: uuidv4(),
            size,
            toppings,
            quantity,
            isComplete: false
        };

        orders.push(newOrder);
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//GET for listing all pizza orders.
app.get('/orders', (req, res) => {
    try {
        res.status(200).json(orders); // Return all orders
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//GET for retrieving a specific pizza order.
app.get('/orders/:id', findOrder, (req, res) => {
    try {
        res.status(200).json({ order: req.order }); // Return the order details
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

 //PUT for modifying a specific pizza order  
app.put('/orders/:id', findOrder, (req, res, next) => {
    try {
        const { size, toppings, quantity } = req.body;

        if(req.order.isComplete === true) {
            return res.status(400).json({ error: `Completed orders cannot be modified`})
        }

        if (!possibleSizes.includes(size)) {
            return res.status(400).json({ error: `Unexpected size received, please choose between: ${possibleSizes.join(', ')}`})
        }
        if (!toppings.every(topping => possibleToppings.includes(topping))) {
            return res.status(400).json({ error: `Unexpected toppings received, please choose between: ${possibleToppings.join(', ')}` });
        }
        if(!possibleQuantities.includes(quantity)) {
            return res.status(400).json({ error: `Unexpected quantity received, for more than 10 pizzas, call the store. Please choose between: ${possibleQuantities.join(', ')}`})
        }

        // Update the order with new data
        req.order.size = size;
        req.order.toppings = toppings;
        req.order.quantity = quantity;

        // Needed to recalculate the price after the order changes
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}, priceCalculation, (req, res) => {
    res.status(200).json({ message: 'Order updated successfully', order: req.order });
});

//DELETE for cancelling an existing pizza order.
app.delete('/orders/:id', findOrder, (req, res) => {
    try {
        // Delete the found order from the array
        const deletedOrder = orders.splice(req.orderIndex, 1)[0];

        res.status(200).json({ message: `Order with ID: ${deletedOrder.id} successfully deleted`, deletedOrder });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//PUT for marking an order as completed.
app.put('/orders/:id/complete', findOrder, priceCalculation, (req, res) => {
    try {
        req.order.isComplete = true;

        // Send back the updated order with the price
        res.status(200).json({ message: `Order ID: ${req.order.id} marked as complete. Total price: $${req.order.price}`, order: req.order });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});