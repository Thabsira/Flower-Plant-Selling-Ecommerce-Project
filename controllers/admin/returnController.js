const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");


const getReturnRequests = async (req, res) => {
    try {
        const returnRequests = await Order.find({ status: "Return Request" })
            .populate("orderItems.product") 
            .populate("address"); 

            console.log(returnRequests);

        res.render("return-request", { returnRequests });
    } catch (error) {
        console.error("Error fetching return requests:", error);
        req.flash("error", "Failed to fetch return requests.");
        res.redirect("/admin/dashboard");
    }
};



const decideReturnRequest = async (req, res) => {
    try {
        const { orderId } = req.params; 
        const { action } = req.body;

        const order = await Order.findOne({ orderId });
        if (!order) {
            req.flash('error', 'Order not found.');
            return res.redirect('/orders');
        }

        if (action === "Accept") {
            order.returnRequestStatus = "Accepted";
            order.status = "Return Approved";
        } else if (action === "Reject") {
            order.returnRequestStatus = "Rejected";
            order.status = "Return Rejected";
        }

        await order.save();

        req.flash('success', `Return request has been ${action.toLowerCase()}.`);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error("Error deciding return request:", error);
        req.flash('error', 'An error occurred while processing the return request.');
        res.redirect('/admin/dashboard');
    }
};





module.exports={
    getReturnRequests,
    decideReturnRequest,
}
