
const Order = require("../../models/orderSchema");
const { default: mongoose } = require("mongoose");
const PDFDocument = require("pdfkit");



const downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const user = req.session.user;

        if (!user) {
            return res.status(401).send("Unauthorized. Please log in.");
        }

        const userId = user.id;

        // Fetch the order and populate the necessary fields
        const order = await Order.findOne({ orderId })
            .populate("orderItems.product")
            .populate("address");

           console.log("orderdrr",order)

        if (!order) {
            return res.status(404).send("Order not found or access denied.");
        }

        // Generate the PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=Invoice-${orderId}.pdf`
        );

        const doc = new PDFDocument();
        doc.pipe(res);

        // Invoice Header
        doc.fontSize(20).text("Order Invoice", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Order ID: ${order.orderId}`);
        doc.text(
            `Order Date: ${
                order.createdOn ? new Date(order.createdOn).toDateString() : "N/A"
            }`
        );
        doc.text(`Status: ${order.status}`);
        doc.text(`Payment Method: ${order.paymentMethod.join(", ")}`);
        doc.text(`Payment Status: ${order.paymentStatus}`);
        doc.moveDown();

        // Ordered Items
        doc.fontSize(16).text("Ordered Items", { underline: true });
        order.orderItems.forEach((item) => {
            doc.fontSize(12).text(`Product: ${item.product.productName}`);
            doc.text(`Description: ${item.product.description}`);
            doc.text(`Price: ₹${item.price}`);
            doc.text(`Quantity: ${item.quantity}`);
            doc.text(`Total: ₹${(item.price * item.quantity).toFixed(2)}`);
            doc.moveDown();
        });

        // Shipping Address
       /* if (order.address) {
            const { name, city, state, pincode, landMark, phone } = order.address;
            doc.fontSize(16).text("Shipping Address", { underline: true });
            doc.fontSize(12).text(`Name: ${name}`);
            doc.text(`City: ${city}, ${state}`);
            doc.text(`Pincode: ${pincode}`);
            doc.text(`Landmark: ${landMark || "N/A"}`);
            doc.text(`Phone: ${phone}`);
        } else {
            doc.fontSize(12).text("No shipping address available.");
        }*/

        // Price Details
        doc.moveDown().fontSize(16).text("Price Details", { underline: true });
        doc.fontSize(12).text(`Subtotal: ₹${order.totalPrice.toFixed(2)}`);
        doc.text(`Discount: ₹${order.discount.toFixed(2)}`);
        doc.text(`Final Amount: ₹${order.finalAmount.toFixed(2)}`);
        if (order.couponApplied) {
            doc.text(`Coupon Applied: ${order.couponApplied}`);
        } else {
            doc.text("Coupon Applied: None");
        }

        doc.end();
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).send("An error occurred while generating the invoice.");
    }
};




//last done
const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })
            .populate('orderItems.product', 'productName productImage salePrice description couponApplied couponCode') // Populate product details
            .populate('address'); // Populate address details
         
        if (!order) {
            return res.status(404).send('Order not found');
        }

       // const selectedAddress = order.address?.address?.[0];
        // Compute cart total (before applying shipping charges and discounts)
        const cartTotal = order.orderItems.reduce((total, item) => {
            return total + item.product.salePrice * item.quantity;
        }, 0);
        res.render('order-details', {
            order,
            cartTotal: cartTotal.toFixed(2), // Pass cart total to view
        });
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).send('Server Error');
    }
};







module.exports = {
    getOrderDetails,
    downloadInvoice,
};