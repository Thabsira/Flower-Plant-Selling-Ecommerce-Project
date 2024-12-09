//const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
//const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");






const getCartPage = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.redirect('/login'); 
        }
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName productImage' 
        });

        if (!cart || cart.items.length === 0) {
            return res.render('cart', { cart: { items: [], cartTotal: 0 } });
        }

        // cart total 
        const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);

        
        res.render('cart', { cart: { items: cart.items, cartTotal } });
    } catch (error) {
        console.error("Error displaying cart page:", error);
        
        res.status(500).send("Server Error");
    }
};



//item add to cart 

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
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ message: 'Product not found' });
        }
        if (product.status !== 'Available' || product.quantity < quantity) {
            return res.status(400).json({ message: 'Product is not available or insufficient stock' });
        }
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            return res.status(200).json({ message: "Item already in cart", alreadyInCart: true });
        } else {
            
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice,
                totalPrice: quantity * product.salePrice,
            });
            await cart.save();
            res.status(200).json({ message: "Item added to cart successfully", alreadyInCart: false });
        }
    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};










const listCartItems = async (req, res) => {
    const userId = req.session.user._id; 
    try {
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart || cart.items.length === 0) {
            return res.render("cart", { items: [], message: "Your cart is empty." });
        }
        res.render("cart", { items: cart.items });
    } catch (error) {
        console.error("Error listing cart items:", error);
        res.status(500).send("Server error");
    }
};



const removeItemFromCart = async (req, res) => {
    try {
        const userId = req.session.user; 
        const { productId } = req.params;
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $pull: { items: { productId } } }, 
            { new: true } 
        ).populate('items.productId');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);
        res.json({ items: cart.items, cartTotal });
    } catch (error) {
        console.error("Error removing item from cart:", error);
        res.status(500).send("Server Error");
    }
};




const updateCartItem = async (req, res) => {
    try {
        const { productId, change } = req.body;
        if (!Number.isInteger(change)) {
            return res.status(400).json({ message: 'Invalid quantity change value' });
        }

        const userId = req.session.user._id;
        console.log('userId:',userId);
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const cart = await Cart.findOne({ userId });
        console.log("cart:",cart);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);
        console.log("item:",item);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        const product = await Product.findById(productId).lean();
        console.log("product",product);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        console.log("checking items:",item.quantity+change);
        console.log("checking available stock:",product.quantity);
        if (item.quantity + change > product.quantity) {
            return res.status(400).json({ message: 'Insufficient stock available' });
        }

        item.quantity += change;
        if (item.quantity < 1) {
            cart.items = cart.items.filter(i => i.productId.toString() !== productId);
        } else {
            item.totalPrice = item.price * item.quantity;
        }

        cart.cartTotal = cart.items.reduce((total, item) => total + item.totalPrice, 0);

    
        await cart.save();

    
        res.json({
            success: true,
            message: 'Cart updated successfully',
            items: cart.items.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                totalPrice: i.totalPrice,
            })),
            cartTotal: cart.cartTotal,
        });
    } catch (error) {
        console.error('Error updating cart item:', error.message || error);
        res.status(500).json({ message: 'Server error' });
    }
};



const getCartCount = async (req, res) => {
    try {
        const userId = req.session.user._id; // Retrieve logged-in user ID from session
        if (!userId) {
            return res.json({ count: 0 }); // Return 0 for unauthenticated users
        }
        
        const cart = await Cart.findOne({ userId });
        const count = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;

        res.json({ count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch cart count" });
    }
};



    
module.exports = {
    getCartPage,
    addToCart,
    listCartItems,
    removeItemFromCart,
    updateCartItem,
    getCartCount,
    
}