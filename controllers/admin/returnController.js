const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");


const getReturnRequests = async (req, res) => {
    try {
        const returnRequests = await Order.find({ status: "Return Request" })
            .populate("orderItems.product") 
            .populate("address"); // Optional: Populate address details

            console.log(returnRequests);

        res.render("return-request", { returnRequests });
    } catch (error) {
        console.error("Error fetching return requests:", error);
        req.flash("error", "Failed to fetch return requests.");
        res.redirect("/admin/dashboard");
    }
};


/*const decideReturnRequest = async (req, res) => {
    const { orderId } = req.params;
    const { action } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            req.flash("error", "Order not found.");
            return res.redirect("/admin/returns");
        }

        if (order.status !== "Return Request") {
            req.flash("error", "Invalid operation. The order is not in a return-request state.");
            return res.redirect("/admin/returns");
        }

        if (action === "Accept") {
            order.status = "Return Accepted";
            order.returnRequestStatus = "Accepted";
        } else if (action === "Reject") {
            order.returnRequestStatus = "Rejected";
        } else {
            req.flash("error", "Invalid action.");
            return res.redirect("/admin/returns");
        }

        await order.save();

        req.flash("success", `Return request ${action.toLowerCase()}ed successfully.`);
        res.redirect("/admin/returns");
    } catch (error) {
        console.error("Error processing return request:", error);
        req.flash("error", "Failed to process the return request.");
        res.redirect("/admin/returns");
    }
};*/


/*const decideReturnRequest = async (req, res) => {
    try {
        const { orderId } = req.params; 
        const { action } = req.body;

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            req.flash('error', 'Order not found.');
            return res.redirect('/admin/return-request');
        }

        console.log('Request Params ID:', req.params); 
console.log('Request Body Action:', req.body);
console.log('Order:', order);


        
        if (action === "Accept") {
            order.returnRequestStatus = "Accepted";
            order.status = "Return Approved"; 
        } else if (action === "Reject") {
            order.returnRequestStatus = "Rejected";
            order.status = "Return Rejected";
        }

        await order.save();

        req.flash('success', `Return request has been ${action.toLowerCase()}.`);
        res.redirect('/return-request');
    } catch (error) {
        console.error("Error deciding return request:", error);
        req.flash('error', 'An error occurred while processing the return request.');
        res.redirect('/return-request');
    }
};*/



const decideReturnRequest = async (req, res) => {
    try {
        const { orderId } = req.params; // Using orderId
        const { action } = req.body;

        // Find the order by orderId
        const order = await Order.findOne({ orderId });
        if (!order) {
            req.flash('error', 'Order not found.');
            return res.redirect('/orders');
        }

        // Update status based on action
        if (action === "Accept") {
            order.returnRequestStatus = "Accepted";
            order.status = "Return Approved";
        } else if (action === "Reject") {
            order.returnRequestStatus = "Rejected";
            order.status = "Return Rejected";
        }

        await order.save();

        req.flash('success', `Return request has been ${action.toLowerCase()}.`);
        res.redirect('/orders');
    } catch (error) {
        console.error("Error deciding return request:", error);
        req.flash('error', 'An error occurred while processing the return request.');
        res.redirect('/orders');
    }
};





module.exports={
    getReturnRequests,
    decideReturnRequest,
}
