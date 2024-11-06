const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");


/*const getOrderHistory = async (req, res) => {
    try {
        
        const userId = req.session.user._id;

        
        const orders = await Order.find({ address: userId })
            .populate({
                path: 'orderItems.product',
                select: 'productName productImage',
            })
            .sort({ createdOn: -1 });

    
        res.render("order-history", { orders });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).send("An error occurred while retrieving order history.");
    }
};*/



 

/*const getOrderHistory = async (req, res) => {
    try {
        const userId = req.session.user._id; 
        console.log("User ID:", userId);
        
        const orders = await Order.find({ userId }).populate({path: 'orderItems.product',
            select: 'productName productImage',});

            console.log(orders);
        res.render('order-history', { orders });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.render('order-history', { orders: [] }); 
    }
};*/


/*const getOrderHistory = async (req, res) => {
    const userId = req.session.user._id; // Assuming you're storing user ID in session
    try {
       // const orders = await Order.find({ address: userId }).populate('orderItems.product');
        // Populate product details
        const orders = await Order.find({ userId: userId }).populate('orderItems.product');
        console.log("Fetched Orders: ", orders); // Log orders to check if they are fetched
        res.render('order-history', { orders }); // Render the order history view
    } catch (error) {
        console.error("Error fetching orders: ", error);
        res.status(500).send("Internal Server Error");
    }
};*/


const getOrderHistory = async(req,res)=>{

    const userId = req.session.user._id; // Ensure this is set correctly
console.log("Fetching orders for userId:", userId); // Log the user ID

try {
   // const orders = await Order.find({ userId: userId }).populate('orderItems.product');
   const orders = await Order.find({ userId }).populate('orderItems.product');
    console.log("Fetched Orders: ", orders); // Log fetched orders
    res.render("order-history", { orders }); // Render the page with orders
} catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Server Error");
}

}




module.exports = {
    getOrderHistory,
}
