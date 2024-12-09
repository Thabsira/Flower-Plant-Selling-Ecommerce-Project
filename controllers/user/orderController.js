const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Wallet = require("../../models/walletSchema");
const { default: mongoose } = require("mongoose");





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
        res.render("order-history", { orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("Server Error");
    }
};




/*const cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId).populate("userId"); 
        if (!order) {
            return res.status(404).send("Order not found");
        }
        if (order.status !== "Pending" && order.status !== "Processing") {
            return res.status(400).send("Order cannot be cancelled");
        }
        const refundAmount = order.finalAmount; 
        if (!order.userId) {
            return res.status(404).send("User not found in the order");
        }
        const user = order.userId;  
        user.wallet += refundAmount; 
        console.log(`Refunding ${refundAmount} to user. New wallet balance: ${user.wallet}`); 
        await user.save();
        order.status = "Cancelled";
        await order.save();

        res.redirect("/userProfile"); 
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Server Error");
    }
};*/




const cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    try {

        const userId = req.session.user._id;

        const order = await Order.findById(orderId).populate("userId");
        if (!order) {
            return res.status(404).send("Order not found");
        }
        if (order.status !== "Pending" && order.status !== "Processing") {
            return res.status(400).send("Order cannot be cancelled");
        }
        const refundAmount = order.finalAmount;
        if (!order.userId) {
            return res.status(404).send("User not found in the order");
        }
        const user = order.userId;

        console.log("user:",user);

        let wallet = await Wallet.findOne({userId:user});
        if(!wallet){
            wallet = new Wallet({
                userId:user,
                balance:0,
                transactions:[],
            })

            await wallet.save();

            await User.findByIdAndUpdate(userId,{$push:{wallet:wallet._id}});
        }

        console.log("wallet",wallet);

        wallet.balance+=refundAmount;
        wallet.transactions.push({
            date: new Date(),
            type:'credit',
            amount:refundAmount,
            description:`refund`,
        })

        await wallet.save();

        console.log('updated wallet',wallet);

        
        // Update order status
        order.status = "Cancelled";
        await order.save();

        res.redirect("/userProfile");
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).send("Server Error");
    }
};




const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body; 

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = 'Return Request';
        order.returnReason = reason; 
        order.returnRequestStatus = "Pending";
        await order.save();

        req.flash('success', 'Your return request has been submitted successfully.');
        res.redirect('/orders/history'); 
    } catch (error) {
        console.error('Error handling return request:', error);
        req.flash('error', 'An error occurred while processing your return request.');
        res.redirect('/profile/orders'); 
    }
};









module.exports = {
    getOrderHistory,
    cancelOrder,
    returnOrder,
}
