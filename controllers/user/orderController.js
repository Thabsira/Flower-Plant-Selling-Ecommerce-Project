const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");



const getOrderHistory = async(req,res)=>{

    const userId = req.session.user._id; 
console.log("Fetching orders for userId:", userId); 

try {
   // const orders = await Order.find({ userId: userId }).populate('orderItems.product');
   const orders = await Order.find({ userId }).populate('orderItems.product');
    console.log("Fetched Orders: ", orders); 
    res.render("order-history", { orders }); 
} catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Server Error");
}

}




module.exports = {
    getOrderHistory,
}
