const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const Coupon = require("../../models/couponSchema");




/*const getCheckoutPage = async (req, res) => {
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
};*/



/*const getCheckoutPage = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.redirect('/login');
        }

        // Get the user's saved addresses
        const userAddressData = await Address.findOne({ userId });
        const addresses = userAddressData ? userAddressData.address : [];

        // Get the user's cart items, populated with product details
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName productImage price' // Include price for total calculation
        });

        // Calculate subtotal, discount, and final total for each item in the cart
        let subtotal = 0;
        let totalDiscount = 0;
        let finalTotal = 0;

        cart.items.forEach(item => {
            // Calculate the total price for each item before discount
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            // Calculate total discount for each item
            const itemDiscount = item.discount * item.quantity;
            totalDiscount += itemDiscount;

            // Calculate the total after discount for each item
            const itemTotalAfterDiscount = itemTotal - itemDiscount;
            item.totalAfterDiscount = itemTotalAfterDiscount;
            finalTotal += itemTotalAfterDiscount;
        });

        // If a coupon is applied, apply the discount at the checkout level
        let couponDiscount = 0;
        if (req.session.couponCode) {
            // Query the database to find the coupon using the code
            const coupon = await Coupon.findOne({ couponCode: req.session.couponCode });

            if (coupon) {
                // Check if the coupon is still valid (not expired)
                if (new Date() < new Date(coupon.expireOn)) {
                    // Apply the discount
                    couponDiscount = coupon.offerPrice;
                } else {
                    // If expired, you could handle it (e.g., show an error message)
                    console.log('Coupon expired');
                }
            } else {
                // If coupon not found, handle it (e.g., show an error message)
                console.log('Invalid coupon code');
            }
        }

        // Calculate the final total after applying coupon
        const totalAfterCoupon = finalTotal - couponDiscount;

        // Render the checkout page with dynamic data
        res.render('checkout', {
            addresses,
            cart: cart || { items: [] },
            subtotal,
            totalDiscount,
            finalTotal,
            couponDiscount,
            totalAfterCoupon,
            couponCode: req.session.couponCode || '',
        });
    } catch (error) {
        console.error("Error loading checkout page:", error);
        res.status(500).send("Server Error");
    }
};*/



const getCheckoutPage = async (req, res) => {
    try {
        const userId = req.session.user?._id;
        if (!userId) {
            return res.redirect('/login');
        }

        // Fetch user's saved addresses
        const userAddressData = await Address.findOne({ userId });
        const addresses = userAddressData ? userAddressData.address : [];

        // Fetch user's cart items with populated product details
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName productImage salePrice discount',
        });

        if (!cart || cart.items.length === 0) {
            return res.render('checkout', {
                addresses,
                cart: { items: [] },
                subtotal: 0,
                totalDiscount: 0,
                finalAmount: 0,
                couponDiscount: 0,
                totalAfterCoupon: 0,
                couponCode: '',
            });
        }

        // Initialize totals
let subtotal = 0;
let totalDiscount = 0;
let finalAmount = 0;

// Iterate over cart items to calculate totals
cart.items.forEach(item => {
    const product = item.productId;

    // Ensure valid price, quantity, and discount
    const itemPrice = typeof product.salePrice === 'number' ? product.salePrice : 0; // Default to 0 if salePrice is invalid
    const itemDiscount = typeof product.discount === 'number' ? product.discount : 0; // Default to 0 if discount is invalid
    const itemQuantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1; // Default to 1 if quantity is invalid

    console.log("Product:", product);
    console.log('Item Quantity:', itemQuantity);
    console.log('Item Price:', itemPrice);
    console.log('Item Discount:', itemDiscount);

    const itemTotal = itemPrice * itemQuantity;
    const discountAmount = itemDiscount * itemQuantity;
    const totalAfterDiscount = itemTotal - discountAmount;

    console.log('Item Total:', itemTotal);
    console.log('Discount Amount:', discountAmount);
    console.log('Total After Discount:', totalAfterDiscount);

    // Accumulate totals
    subtotal += itemTotal;
    totalDiscount += discountAmount;
    finalAmount += totalAfterDiscount;


   

    // Add calculated values to item for later use (e.g., for display)
    item.totalPrice = itemTotal;
    item.totalDiscount = discountAmount;
    item.totalAfterDiscount = totalAfterDiscount;
});

// After the loop, check totals:
console.log('Subtotal:', subtotal);
console.log('Total Discount:', totalDiscount);
console.log('Final Amount:', finalAmount);


req.session.finalAmount = finalAmount;
console.log('Updated session:', req.session); 



        const coupons = await Coupon.find({});
        console.log('Coupons:', coupons); // Debug coupons

        // Check for applied coupon
        let couponDiscount = 0;
        if (req.session.couponCode) {
            const coupon = await Coupon.findOne({ couponCode: req.session.couponCode });

            if (coupon) {
                if (new Date() < new Date(coupon.expireOn)) {
                    if (subtotal >= coupon.minimumPrice) {
                        couponDiscount = coupon.offerPrice || (coupon.discount ? (subtotal * coupon.discount) / 100 : 0);
                    } else {
                        console.log(`Minimum order value for this coupon is ${coupon.minimumPrice}`);
                    }
                } else {
                    console.log('Coupon expired');
                }
            } else {
                console.log('Invalid coupon code');
            }
        }

        const totalAfterCoupon = Math.max(finalAmount - couponDiscount, 0);

        // Render checkout page with calculated values
        res.render('checkout', {
            addresses,
            cart,
            subtotal,
            finalAmount:req.session.finalAmount,
            totalDiscount,
            couponDiscount,
            totalAfterCoupon,
            coupons,
            couponCode: req.session.couponCode || '',
        });
    } catch (error) {
        console.error('Error loading checkout page:', error);
        res.status(500).send('Server Error');
    }
};






/*const placeOrder = async (req, res) => {
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
           /* status: "Pending",
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
};*/



/*const placeOrder = async (req, res) => {
    try {
        console.log("Place order route hit");
        const userId = req.session.user._id;
        const { addressId, paymentMethod, couponCode } = req.body; // Added couponCode

        console.log("Received Address ID:", addressId);
        console.log("Received Payment Method:", paymentMethod);
        console.log("Received Coupon Code:", couponCode); // Log coupon code if provided

        // Retrieve the cart for the user
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        console.log("Cart:", cart);
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Retrieve the selected address
        const address = await Address.findOne({ userId, "address._id": addressId });
        console.log("Address Found:", address);
        if (!address) {
            return res.status(400).json({ message: "Address not found" });
        }

        // Calculate total price without coupon first
        let totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log("Total Price:", totalPrice);

        // Check for sufficient stock
        for (const item of cart.items) {
            if (item.productId.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${item.productId.productName}`
                });
            }
        }

        // Check if a coupon code was provided
        let discount = 0; // Default discount is 0
        if (couponCode) {
            const coupon = await Coupon.findOne({ couponCode });
            console.log("Coupon:", coupon);

            if (!coupon || coupon.expireOn < Date.now() || !coupon.isList) {
                return res.status(400).json({ message: "Invalid or expired coupon" });
            }

            // Check if the total price meets the minimum requirement for the coupon
            if (totalPrice < coupon.minimumPrice) {
                return res.status(400).json({ message: `Coupon requires a minimum order of $${coupon.minimumPrice}` });
            }

            // Apply the discount (can be percentage or fixed amount)
            if (coupon.offerPrice && coupon.offerPrice > 0) {
                // Fixed amount off
                discount = coupon.offerPrice;
            } else if (coupon.discount) {
                // Percentage off
                discount = (totalPrice * coupon.discount) / 100;
            }
        }

        // Apply the discount to the total price
        const finalAmount = totalPrice - discount;
        console.log("Discount Applied:", discount);
        console.log("Final Amount:", finalAmount);

        // Create the order
        const order = new Order({
            userId: userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice,
            finalAmount, // Updated with discount
            address: addressId,
            status: "Pending",
            createdOn: Date.now()
        });

        console.log("Order to be saved:", order);

        // Handle payment method
        if (paymentMethod === "cash_on_delivery") {
            order.paymentStatus = "Pending";
        }

        // Save the order
        await order.save();

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { quantity: -item.quantity }
            });
        }

        // Clear the cart
        await Cart.deleteOne({ userId });

        // Add the order to user's order history
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: order._id }
        });

        // Respond with success
        res.json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order" });
    }
};*/




const placeOrder = async (req, res) => {
    try {
        console.log("Place order route hit");
        const userId = req.session.user._id;
        const { addressId, paymentMethod, couponCode } = req.body;

        console.log("Received Address ID:", addressId);
        console.log("Received Payment Method:", paymentMethod);
        console.log("Received Coupon Code:", couponCode);

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

       // const userAddressData = await Address.findOne({ userId });
       // const address = userAddressData?.address.find(addr => addr._id.toString() === addressId);
       const userAddressData = await Address.findOne({ userId });
       const address = userAddressData?.address.find(addr => addr._id.toString() === addressId);

        if (!address) {
            return res.status(400).json({ message: "Address not found" });
        }

        // Calculate total price before discount
        let totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log("Total Price (before discount):", totalPrice);

        // Check stock availability
        for (const item of cart.items) {
            if (item.productId.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${item.productId.productName}`
                });
            }
        }

        // Initialize discount and validate coupon (if provided)
        let discount = 0;
        let isCouponApplied = false;

        if (couponCode) {
            const coupon = await Coupon.findOne({ couponCode });
            if (!coupon || new Date() > new Date(coupon.expireOn) || !coupon.isList) {
                return res.status(400).json({ message: "Invalid or expired coupon" });
            }

            if (totalPrice < coupon.minimumPrice) {
                return res.status(400).json({ 
                    message: `Coupon requires a minimum order of $${coupon.minimumPrice}` 
                });
            }

            // Apply discount based on coupon type
            if (coupon.offerPrice && coupon.offerPrice > 0) {
                discount = coupon.offerPrice; // Fixed discount
            } else if (coupon.discount && coupon.discount > 0) {
                discount = (totalPrice * coupon.discount) / 100; // Percentage discount
            }

            isCouponApplied = true;
        }

        // Calculate final amount after applying discount
        const finalAmount = Math.max(totalPrice - discount, 0);
        console.log("Discount Applied:", discount);
        console.log("Final Amount (after discount):", finalAmount);
        
        

        // Create the order
        const order = new Order({
            userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice,
            finalAmount,
            discount,
            address: address._id,
           /* address: {
                fullName: address.fullName,
                mobile: address.mobile,
                pincode: address.pincode,
                city: address.city,
                state: address.state,
                landmark: address.landmark,
                addressLine: address.addressLine
                
            },*/
            status: "Pending",
            paymentMethod,
            paymentStatus: paymentMethod === "cash_on_delivery" ? "Pending" : "Paid",
            couponApplied: isCouponApplied,
            createdOn: Date.now()
        });
        console.log("Received Payment Method:", paymentMethod);

        console.log("Order to be saved:", order);

        // Save the order
        await order.save();

        // Update product stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { quantity: -item.quantity }
            });
        }

        // Clear the user's cart
        await Cart.deleteOne({ userId });

        // Add the order to the user's order history
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: order._id }
        });

        // Respond with success
        res.json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order" });
    }
};















const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;  // Get coupon code from request
        const userId = req.session.user?._id;

        // Log userId and couponCode
        console.log("User ID:", userId);
        console.log("Coupon Code:", couponCode);

        if (!userId) {
            return res.status(400).json({ message: "Please login to apply a coupon" });
        }

        // Fetch user's cart
        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName productImage salePrice discount',
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        // Log the cart items
        console.log("Cart Items:", cart.items);

        // Fetch the coupon from the database
        const coupon = await Coupon.findOne({ couponCode });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        // Log coupon details
        console.log("Coupon Found:", coupon);

        // Check if the coupon is expired
        if (new Date() > new Date(coupon.expireOn)) {
            return res.status(400).json({ message: "Coupon expired" });
        }

        // Log expiry check
        console.log("Coupon Expiry Date:", coupon.expireOn);

        // Check if the coupon is valid (not used before)
        if (coupon.userId.includes(userId)) {
            return res.status(400).json({ message: "You have already used this coupon" });
        }

        // Fetch the current final amount (finalAmount) from session, which was set in getCheckoutPage
        const finalAmount = req.session.finalAmount;  // Assuming finalAmount was stored in session during checkout page rendering

        // Log the final amount before applying the coupon
        console.log("Final Amount Before Coupon:", finalAmount);

        // Ensure the finalAmount is enough for the coupon to apply
        if (finalAmount < coupon.minimumPrice) {
            return res.status(400).json({ message: `Coupon requires a minimum order of $${coupon.minimumPrice}` });
        }

        // Log the minimum price required for coupon
        console.log("Coupon Minimum Price:", coupon.minimumPrice);

        // Calculate the discount amount for the finalAmount
        let discount = 0;
        if (coupon.offerPrice) {
            discount = coupon.offerPrice;
            console.log("Fixed Offer Price Discount Applied:", discount);
        } else if (coupon.discount) {
            discount = (finalAmount * coupon.discount) / 100;  // Use finalAmount to calculate discount
            console.log("Percentage Discount Applied:", discount);
        }

        // Calculate the total after applying the coupon
        let totalAfterCoupon = finalAmount - discount;

        // Log the total after applying the coupon
        console.log("Total After Coupon:", totalAfterCoupon);

        // Store the applied coupon code and final amount after coupon in session
        req.session.couponCode = couponCode;  // Save coupon code in session
        req.session.totalAfterCoupon = totalAfterCoupon;  // Store the final amount after coupon applied

        // Log session values
        console.log("Updated Session Values:", {
            couponCode: req.session.couponCode,
            totalAfterCoupon: req.session.totalAfterCoupon,
        });

        // Send response with the updated checkout total after coupon
        res.json({
            message: "Coupon applied successfully!",
           // discount,
           // totalAfterCoupon,  // Updated total after coupon
            //couponCode: req.session.couponCode, // Persisted coupon code
            subtotal: finalAmount,  // This should be the original subtotal before applying the coupon
            couponDiscount: discount,  // The discount applied from the coupon
            totalAfterCoupon: totalAfterCoupon,  
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ message: "Server error" });
    }
};










module.exports = {
    getCheckoutPage,
    placeOrder,
    applyCoupon,
};