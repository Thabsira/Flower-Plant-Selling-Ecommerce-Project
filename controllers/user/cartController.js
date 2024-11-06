const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");


/*const getCartPage = async (req, res) => {
    try {
        const userId = req.session.user;

        // For now, assume we’ll fetch cart details later
        res.render('cart', { cartItems: [] }); // Send empty cart items for now
    } catch (error) {
        console.error("Error displaying cart page:", error);
        res.status(500).send("Server Error");
    }
};*/


/*const getCartPage = async (req, res) => {
    try {
        const userId = req.session.user?._id; // Check if user is logged in

        if (!userId) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        // Fetch the user's cart from the database
        const cart = await Cart.findOne({ userId }).populate('items.productId'); // Populate product details

        // Pass the cart data to the view
        res.render('cart', { cart }); 
    } catch (error) {
        console.error("Error displaying cart page:", error);
        res.status(500).send("Server Error");
    }
};*/


/*const getCartPage = async (req, res) => {
    try {
        const userId = req.session.user;

        // Fetch cart and populate the product details for each item
        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart) {
            return res.render('cart', { cartItems: [] }); // Empty cart if none exists
        }

        // Pass populated cart items to the template
        res.render('cart', { cartItems: cart.items });
    } catch (error) {
        console.error("Error displaying cart page:", error);
        res.status(500).send("Server Error");
    }
};*/



const getCartPage = async (req, res) => {
    try {
        const userId = req.session.user;

        // Fetch cart and populate the product details for each item
       // const cart = await Cart.findOne({ userId }).populate("items.productId");

       const cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        select: 'productName productImage' // Retrieve productName and productImage fields
    });
    console.log(cart.items); 

        if (!cart || cart.items.length === 0) {
            return res.render('cart', { cart: { items: [], cartTotal: 0 } });
        }

        // Calculate the cart total based on each item's totalPrice
        const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Pass cart data (with populated items and total) to the template
        res.render('cart', { cart: { items: cart.items, cartTotal } });
    } catch (error) {
        console.error("Error displaying cart page:", error);
        res.status(500).send("Server Error");
    }
};





/*const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId; // Get user ID from session

    try {

        if(!productId || quantity <=1 ){
            return res.status(400).json({message:'Invalid product Id or quantity'})
        }


        const product = await Product.findById(productId);
        if (!product || product.status !== 'Available') {
            return res.status(400).json({message:'Product is out of stock'});
        }

        if (quantity > product.quantity) {
            return res.status(400).json({message:'Not enough stock available'});
        }
        

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            // Create new cart if it doesn't exist
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            // Update existing item quantity
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
        } else {
            // Add new item
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice, // or product.regularPrice based on your logic
                totalPrice: quantity * product.salePrice,
            });
        }

        await cart.save();
        res.status(200).send('Item added to cart');
    } catch (error) {
        res.status(500).send('Server error');
    }
};*/



/*const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;
    console.log("User ID from session:", userId);
    console.log("Received addToCart request for:", { productId, quantity, userId });
    try {
        // Check for valid product ID and quantity
        if (!productId || quantity < 1) {
            console.log("Invalid product ID or quantity:", { productId, quantity });
            return res.status(400).json({ message: 'Invalid product ID or quantity' });
        }

        // Find the product and check if it has sufficient stock
        const product = await Product.findById(productId);
        if (!product) {
            console.log("Product not found for ID:", productId);
            return res.status(400).json({ message: 'Product not found' });
        }

        // Check if the product is available based on quantity
        if (product.quantity < 1) {
            console.log("Product is out of stock:", { productId, availableQuantity: product.quantity });
            return res.status(400).json({ message: 'Product is out of stock' });
        } else if (quantity > product.quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Find or create the user's cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Check if the item already exists in the cart
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex > -1) {
            // Update the quantity of the existing item in the cart
            const existingItem = cart.items[existingItemIndex];
            const updatedQuantity = existingItem.quantity + quantity;

           

            // Ensure updated quantity does not exceed product stock
            if (updatedQuantity > product.quantity) {
                return res.status(400).json({ message: 'Not enough stock available' });
            }

            existingItem.quantity = updatedQuantity;
            existingItem.totalPrice = updatedQuantity * existingItem.price;
            console.log("Updated existing item in cart:", existingItem);
        } else {
            // Add a new item if it does not exist in the cart
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice,
                totalPrice: quantity * product.salePrice,
                
            });
            console.log("Added new item to cart:", { productId, quantity, price: product.salePrice });
        }

        // Save the updated cart
        await cart.save();
        console.log("Cart updated successfully for user:", userId);
        res.status(200).json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).send('Server error');
    }
};*/


/*const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
  //  const userId = req.session.userId;
  const userId = req.session.user ? req.session.user._id : null; 

    if (!userId) {
        return res.status(401).send("User not authenticated");
    }

    try {
        if (!productId || quantity < 1) {
            return res.status(400).json({ message: 'Invalid product Id or quantity' });
        }

        const product = await Product.findById(productId);
        if (!product || product.status !== 'Available' || product.quantity < quantity) {
            return res.status(400).json({ message: 'Product is out of stock or insufficient quantity' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice,
                totalPrice: quantity * product.salePrice,
            });
        }

        await cart.save();
        res.status(200).send("Item added to cart");
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).send("Server error");
    }
};*/




const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.user ? req.session.user._id : null;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        if (!productId || quantity < 1) {
            return res.status(400).json({ message: 'Invalid product Id or quantity' });
        }

        // Fetch product and log for debugging
        const product = await Product.findById(productId);
        console.log("Fetched Product:", product);

        // Check product availability and stock level
        if (!product) {
            return res.status(400).json({ message: 'Product not found' });
        }
        if (product.status !== 'Available') {
            console.log("Product not available:", product.status);
            return res.status(400).json({ message: 'Product is not available' });
        }
        if (product.quantity < quantity) {
            console.log("Insufficient stock:", product.quantity);
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Find or create cart for user
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        // Update or add item in cart
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice,
                totalPrice: quantity * product.salePrice,
            });
        }

        await cart.save();
        res.status(200).json({ message: "Item added to cart successfully" });
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};




const listCartItems = async (req, res) => {
    const userId = req.session.user._id; // Ensure user is authenticated

    try {
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart || cart.items.length === 0) {
            return res.render("cart", { items: [], message: "Your cart is empty." });
        }
        // Render the cart page with the list of items
        res.render("cart", { items: cart.items });
    } catch (error) {
        console.error("Error listing cart items:", error);
        res.status(500).send("Server error");
    }
};



const removeItemFromCart = async (req, res) => {
    try {
        const userId = req.session.user; // Get userId from session
        const { productId } = req.params; // Get productId from request parameters

        // Find the cart and remove the item
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId } } }, // Pull the item with the specified productId
            { new: true } // Return the modified document
        ).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Calculate the updated cart total
        const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Send the updated cart data back to the client
        res.json({ items: cart.items, cartTotal });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).send("Server Error");
    }
};



// Update cart item quantity
/*const updateCartItem = async (req, res) => {
    try {
        const { productId, change } = req.body;
        const userId = req.session.user; // Get user ID from session

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the item in the cart
        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update the quantity
        item.quantity += change;

        // Prevent quantity from going below 1
        if (item.quantity < 1) {
            item.quantity = 1;
        }

        // Update the total price
        item.totalPrice = item.price * item.quantity;

        // Save the updated cart
        await cart.save();

        // Return updated cart data
        res.json(cart);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};*/



/*const updateCartItem = async (req, res) => {
    try {
        const { productId, change } = req.body;
        const userId = req.session.user; // Get user ID from session

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the item in the cart
        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update the quantity
        item.quantity += change;

        // Prevent quantity from going below 1
        if (item.quantity < 1) {
            item.quantity = 1;
        }

        // Update the total price
        item.totalPrice = item.price * item.quantity;

        // Recalculate cart total
        cart.cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Save the updated cart
        await cart.save();

        // Return updated cart data
        res.json(cart);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};*/


const updateCartItem = async (req, res) => {
    try {
        const { productId, change } = req.body;
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Update the quantity
        item.quantity += change;

        // Remove item if quantity is less than 1
        if (item.quantity < 1) {
            cart.items = cart.items.filter(i => i.productId.toString() !== productId);
        } else {
            // Update the total price if item remains in the cart
            item.totalPrice = item.price * item.quantity;
        }

        // Recalculate cart total
        cart.cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        // Save the updated cart
        await cart.save();

        // Return updated cart data
        res.json(cart);
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ message: 'Server error' });
    }
};















module.exports = {
    getCartPage,
    addToCart,
    listCartItems,
    removeItemFromCart,
    updateCartItem,
    
}