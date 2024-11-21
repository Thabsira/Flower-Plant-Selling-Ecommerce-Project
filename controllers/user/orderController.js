const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");



const getOrderHistory = async(req,res)=>{

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

}



const cancelOrder = async (req, res) => {
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
};



const returnOrder = async (req, res) => {
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
};








module.exports = {
    getOrderHistory,
    cancelOrder,
    returnOrder,
}
