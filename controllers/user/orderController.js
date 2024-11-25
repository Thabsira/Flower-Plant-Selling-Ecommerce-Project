const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const { default: mongoose } = require("mongoose");



/*const getOrderHistory = async(req,res)=>{

    const userId = req.session.user._id; 
console.log("Fetching orders for userId:", userId); 

try {
   // const orders = await Order.find({ userId: userId }).populate('orderItems.product');
   const orders = await Order.find({ userId }).populate('orderItems.product').sort({createdOn:-1});
    console.log("Fetched Orders: ", orders); 
    res.render("order-history", { orders }); 
} catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Server Error");
}

}*/



/*const getOrderHistory = async (req, res) => {
    const orderId = req.params.orderId; 
    console.log("Fetching order for orderId:", orderId);

    try {
        const order = await Order.findOne({ orderId }).populate('orderItems.product'); 
        if (!order) {
            return res.status(404).send("Order not found");
        }
        console.log("Fetched Order: ", order);
        res.render("order-history", { orders: [order] });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).send("Server Error");
    }
};*/



const getOrderHistory = async (req, res) => {
    const userId = req.session.user._id;
    console.log("Fetching orders for userId:", userId);

    try {
        const orders = await Order.find({ userId:new mongoose.Types.ObjectId(userId) }).populate('orderItems.product').sort({ createdOn: -1 });
        console.log("Fetched Orders:", orders); 
        if (!orders.length) {
            console.log("No orders found for userId:", userId);
            return res.status(404).send("No orders found");
        }
        console.log("Fetched Orders: ", orders);
        res.render("order-history", { orders }); // Pass all orders to the view
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Server Error");
    }
};










/*const getOrderHistory = async (req, res) => {
    try {
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "User not logged in." });
        }

        // Fetch orders for the logged-in user
        const orders = await Order.find({ userId })
            .populate('orderItems.product')
            .sort({ createdOn: -1 }); // Latest orders first

        res.render('order-history', {
            orders: orders.map(order => ({
                ...order.toObject(),
                totalPrice: order.amount, // Display the discounted total
                discount: order.discount, // Display the discount
                couponCode: order.couponCode,
             // Show the applied coupon
            })),
        });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Error fetching order history." });
    }
};*/



/*const getOrderHistory = async (req, res) => {
    try {
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "User not logged in." });
        }

        // Fetch orders for the logged-in user
        const orders = await Order.find({ user: userId })  // Use 'user' if that's the field in the Order schema
            .populate('orderItems.product')  // Assuming you want to populate the product details
            .sort({ createdOn: -1 });  // Latest orders first

        // Map the orders to pass necessary data to the view
        res.render('order-history', {
            orders: orders.map(order => ({
                ...order.toObject(),
                totalPrice: order.amount,  // If the amount field holds the total
                discount: order.discount,  // If there's a discount field in the order
                couponCode: order.couponCode,  // Show the applied coupon
            })),
        });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Error fetching order history." });
    }
};*/


/*const getOrderHistory = async (req, res) => {
    try {
        const userId = req.session.user?._id;

        if (!userId) {
            return res.status(401).json({ message: "User not logged in." });
        }

        // Fetch orders for the logged-in user
        const orders = await Order.find({ user: userId })  // Assuming the field is 'user' in your Order schema
            .populate('orderItems.product')  // Populate the product field
            .sort({ createdOn: -1 });  // Latest orders first


console.log(orders);

        // Render the order history page, passing the orders directly
        res.render('order-history', {
            orders: orders,  // Pass orders directly to the view
        });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ message: "Error fetching order history." });
    }
};*/






/*const cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        if (order.status !== "Pending" && order.status !== "Processing") {
            return res.status(400).send("Order cannot be cancelled");
        }
        order.status = "Cancelled";
        await order.save();

        res.redirect("/orders/history");
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Server Error");
    }
};*/




/*const cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Check if the order status allows cancellation
        if (order.status !== "Pending" && order.status !== "Processing") {
            return res.status(400).send("Order cannot be cancelled");
        }

        // Refund logic: credit amount to user's wallet
        const refundAmount = order.finalAmount; // Assuming 'finalAmount' holds the order's total price
        const user = await User.findById(order.user); // Assuming 'user' field in Order schema references User schema

        if (user) {
            user.wallet += refundAmount; // Add the refund amount to the user's wallet
            await user.save(); // Save the updated wallet balance
        }

        // Update order status to 'Cancelled'
        order.status = "Cancelled";
        await order.save();

        // Redirect or respond with success
        res.redirect("/orders/history");
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Server Error");
    }
};*/




/*const cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Fetch the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).send("Order not found");
        }

        if (order.status !== "Pending" && order.status !== "Processing") {
            return res.status(400).send("Order cannot be cancelled");
        }

        // Assuming 'finalAmount' is the refund value
        const refundAmount = order.finalAmount; 

        // Fetch the associated user from the order
        const user = await User.findById(order.user); // Make sure 'order.user' is correctly populated

        if (!user) {
            return res.status(404).send("User not found");
        }

        // Add the refund amount to the user's wallet
        user.wallet += refundAmount; // Increase the wallet balance by refund amount
        console.log(`Refunding ${refundAmount} to user. New wallet balance: ${user.wallet}`); // Debug log to check if this is executing

        // Save the updated wallet balance
        await user.save(); 

        // Update the order status to 'Cancelled'
        order.status = "Cancelled";
        await order.save(); // Save the updated order

        // Redirect the user to their profile or order history page
        res.redirect("/profile"); // or wherever you want the user to go after cancellation
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Server Error");
    }
};*/





const cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Fetch the order by ID and populate the 'userId' field
        const order = await Order.findById(orderId).populate("userId"); // Use userId, not user

        if (!order) {
            return res.status(404).send("Order not found");
        }

        if (order.status !== "Pending" && order.status !== "Processing") {
            return res.status(400).send("Order cannot be cancelled");
        }

        // Assuming 'finalAmount' is the refund value
        const refundAmount = order.finalAmount; 

        // Check if user is populated correctly
        if (!order.userId) {
            return res.status(404).send("User not found in the order");
        }

        // Add the refund amount to the user's wallet
        const user = order.userId;  // Access the populated user
        user.wallet += refundAmount; // Increase the wallet balance by refund amount
        console.log(`Refunding ${refundAmount} to user. New wallet balance: ${user.wallet}`); // Debug log to check if this is executing

        // Save the updated wallet balance
        await user.save();

        // Update the order status to 'Cancelled'
        order.status = "Cancelled";
        await order.save(); // Save the updated order

        // Redirect the user to their profile or order history page
        res.redirect("/userProfile"); // or wherever you want the user to go after cancellation
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Server Error");
    }
};











/*const returnOrder = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.session.user._id;

    try {
        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).send('Order not found.');
        }

        if (order.status !== 'Delivered') {
            return res.status(400).send('This order is not eligible for return.');
        }
        order.status = 'Return Request';
        await order.save();
        res.redirect('/orders/history');
    } catch (error) {
        console.error("Error processing return:", error);
        res.status(500).send("Server Error");
    }
};*/





const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body; // Assuming the return reason is sent from the form

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update the order status to 'Return Request' and add the reason
        order.status = 'Return Request';
        order.returnReason = reason; // Ensure your schema supports a field for returnReason
        order.returnRequestStatus = "Pending";
        await order.save();

        // Respond with success
        req.flash('success', 'Your return request has been submitted successfully.');
        res.redirect('/orders/history'); // Redirect to the orders page or another relevant page
    } catch (error) {
        console.error('Error handling return request:', error);
        req.flash('error', 'An error occurred while processing your return request.');
        res.redirect('/profile/orders'); // Redirect to a fallback page
    }
};









module.exports = {
    getOrderHistory,
    cancelOrder,
    returnOrder,
}
