const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema")




const getCheckoutPage = async (req, res) => {
    try {
        const userId = req.session.user; 
        if (!userId) {
            return res.redirect('/login'); 
        }

        const userAddressData = await Address.findOne({ userId });
        const addresses = userAddressData ? userAddressData.address : [];

      const cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        select: 'productName productImage' 
    });
        res.render('checkout', {
            addresses,
            cart: cart || { items: [] }, 
        });
    } catch (error) {
        console.error("Error loading checkout page:", error);
        res.status(500).send("Server Error");
    }
};




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


        const order = new Order({
            userId: userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice,
            finalAmount: totalPrice, 
            address:addressId ,
           /*address: {
            street: address.address.street,
            city: address.address.city,
            // add other address fields as needed
        },*/
            status: "Pending",
            createdOn: Date.now()
        });

        
         console.log("Found Address:", address); 

        console.log("Order to be saved:", order);

        if (paymentMethod === "cash_on_delivery") {
            order.paymentStatus = "Pending";
        }

        await order.save();

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { quantity: -item.quantity }
            });
        }

        
        await Cart.deleteOne({ userId });

        
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: order._id }
        });


      //  res.json({ message: "Order placed successfully!", orderId: order._id });
      // res.redirect('/checkout/order-confirmation');
      res.json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order" });
    }
};






const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body; // Coupon code from the user
        const userId = req.session.user._id; // Logged-in user's ID

        // Check if the coupon exists
        const coupon = await Coupon.findOne({ couponCode });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Check if the coupon is expired
        const currentDate = new Date();
        if (coupon.expireOn < currentDate) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        // Check if the coupon has already been used by the user
        if (coupon.userId.includes(userId)) {
            return res.status(400).json({ message: "You have already used this coupon" });
        }

        // Fetch the user's cart
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Validate minimum order value
        const cartTotal = cart.cartTotal || cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
        if (cartTotal < coupon.minimumPrice) {
            return res.status(400).json({ message: `Minimum order value for this coupon is ${coupon.minimumPrice}` });
        }

        // Apply discount
        const discount = coupon.offerPrice;
        const totalAfterDiscount = cartTotal - discount;
        cart.discount = discount; // Add discount to cart
        cart.totalAfterDiscount = totalAfterDiscount; // Add final price to cart

        // Save changes
        await cart.save();

        // Mark coupon as used by the user
        coupon.userId.push(userId);
        await coupon.save();

        res.json({
            message: "Coupon applied successfully!",
            discount,
            totalAfterDiscount,
        });
    } catch (error) {
        console.error("Error applying coupon:", error);
        res.status(500).json({ message: "Server error" });
    }
};




module.exports = {
    getCheckoutPage,
    placeOrder,
    applyCoupon,
};