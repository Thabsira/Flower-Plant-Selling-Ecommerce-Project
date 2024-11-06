const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema")

/*const getCheckoutPage = async (req, res) => {
    try {
        const userId = req.session.user; // Assuming user ID is saved in session
        if (!userId) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        // Retrieve the user’s addresses
        const userAddressData = await Address.findOne({ userId });

        // Render checkout page and pass addresses to the view
        res.render('checkout', {
            addresses: userAddressData ? userAddressData.address : [],
        });
    } catch (error) {
        console.error("Error loading checkout page:", error);
        res.status(500).send("Server Error");
    }
};*/



const getCheckoutPage = async (req, res) => {
    try {
        const userId = req.session.user; // Assuming user ID is saved in session
        if (!userId) {
            return res.redirect('/login'); // Redirect to login if not logged in
        }

        // Retrieve the user’s addresses
        const userAddressData = await Address.findOne({ userId });
        const addresses = userAddressData ? userAddressData.address : [];

        // Retrieve the user's cart items
      //  const cart = await Cart.findOne({ userId }).populate('items.productId'); // Populate to access product details
      const cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        select: 'productName productImage' // Retrieve productName and productImage fields
    });

        // Render checkout page with both addresses and cart items
        res.render('checkout', {
            addresses,
            cart: cart || { items: [] }, // Ensure cart is defined even if no items
        });
    } catch (error) {
        console.error("Error loading checkout page:", error);
        res.status(500).send("Server Error");
    }
};


/*const placeOrder = async (req, res) => {
    try {
        console.log("Place order route hit");
        const userId = req.session.user._id;
        const { addressId, paymentMethod } = req.body;

        console.log("Received Address ID:", addressId);
        console.log("Received Payment Method:", paymentMethod);

        // Validate if cart exists for the user
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Get the selected address
        const address = await Address.findOne({ userId, "address._id": addressId });
        if (!address) {
            return res.status(400).json({ message: "Address not found" });
        }

        // Calculate total price
        const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Create new order
        const order = new Order({
            userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice,
            finalAmount: totalPrice, // assuming no discount here
            address: addressId,
            status: "Pending",
            createdOn: Date.now()
        });

        if (paymentMethod === "cash_on_delivery") {
            order.paymentStatus = "Pending";
        }

        await order.save();

        // Clear user cart after order placement
        await Cart.deleteOne({ userId });

        // Add order to user's order history
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: order._id }
        });

        // Redirect to order confirmation page or send success response
        res.json({ message: "Order placed successfully!", orderId: order._id });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order" });
    }
};*/



const placeOrder = async (req, res) => {
    try {
        console.log("Place order route hit");
        const userId = req.session.user._id;
        const { addressId, paymentMethod } = req.body;

        console.log("Received Address ID:", addressId);
        console.log("Received Payment Method:", paymentMethod);

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        console.log("Cart:", cart);
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        
        const address = await Address.findOne({ userId, "address._id": addressId });
        console.log("Address Found:", address);
        if (!address) {
            return res.status(400).json({ message: "Address not found" });
        }

        
        const totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log("Total Price:", totalPrice);


        for (const item of cart.items) {
            if (item.productId.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${item.productId.productName}`
                });
            }
        }



        // Create new order
        const order = new Order({
            userId: userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice,
            finalAmount: totalPrice, // assuming no discount here
            address: addressId,
            status: "Pending",
            createdOn: Date.now()
        });

        console.log("Order to be saved:", order);

        if (paymentMethod === "cash_on_delivery") {
            order.paymentStatus = "Pending";
        }

        await order.save();

        // **Update Stock**: Deduct stock quantities based on order
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { quantity: -item.quantity }
            });
        }

        
        await Cart.deleteOne({ userId });

        
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: order._id }
        });


        res.json({ message: "Order placed successfully!", orderId: order._id });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order" });
    }
};



module.exports = {
    getCheckoutPage,
    placeOrder,
};
