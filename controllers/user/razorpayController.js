const Razorpay = require('razorpay');
const Address = require("../../models/addressSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});





const createRazorpayOrder = async (req, res) => {
    const { addressId } = req.body;
    const userId = req.session.user._id;

    try {
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        await Cart.deleteOne({ userId });
        if (!cart || !cart.items.length) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const amount = req.session.totalAfterCoupon + 50 || req.session.finalAmount + 50;
        const discount = req.session.finalAmount - req.session.totalAfterCoupon || 0;


        const address = await Address.findOne({address:{$elemMatch:{_id:addressId}}}).lean()
       
        console.log("address",address);

        if (!address || address.length === 0) {
            console.error("Address not found");
            return res.status(400).json({ success: false, message: "Address not found" });
        }

        console.log("Address fetched successfully:", address);


        const newOrder = new Order({
            userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price,
            })),
            totalPrice: req.session.finalAmount + 50,
            finalAmount: amount,
            address: addressId,
            status: "Pending",
            paymentMethod: "Razorpay",
            paymentStatus: "Pending",
            couponApplied: req.session.couponCode || null,
            discount,
            
            
        });

        const savedOrder = await newOrder.save();

        // Create Razorpay order
        const orderOptions = {
            amount: amount * 100,
            currency: "INR",
            receipt: `order_${savedOrder._id}`,
            notes: {
                addressId: addressId,
                couponCode: req.session.couponCode || "No coupon",
                
                
            },
        };

        razorpay.orders.create(orderOptions, async (err, order) => {
            if (err) {
                console.error("Error creating Razorpay order:", err);
                return res.status(500).json({ success: false, message: "Error creating Razorpay order" });
            }

            // Update the Razorpay order ID in the database
            savedOrder.razorpayOrderId = order.id;
            await savedOrder.save();

            return res.json({
                success: true,
                order: {
                    id: order.id,
                    amount: order.amount + 50,
                    key: process.env.RAZORPAY_KEY_ID,
                },
            });
        });
    
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ success: false, message: "Error creating order" });
    }
};




const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature,addressId } = req.body;
        const userId = req.session.user._id;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(body)
            .digest("hex");

        const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
        /*const address = await Address.findOne({address:{$elemMatch:{_id:addressId}}}).lean()
       
        console.log("address",address);

        if (!address || address.length === 0) {
            console.error("Address not found");
            return res.status(400).json({ success: false, message: "Address not found" });
        }

        console.log("Address fetched successfully:", address);*/

        console.log("verifypaymentorder",order);

        if (!order) {
            console.error("Order not found");
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (expectedSignature === razorpay_signature) {
            // Payment success
            order.paymentStatus = "Paid";
            order.status = "Processing";
            order.razorpayPaymentId = razorpay_payment_id;
            order.razorpaySignature = razorpay_signature;
            await order.save();

            const cart = await Cart.findOne({ userId }).populate("items.productId");
            if (cart) {
                for (const item of cart.items) {
                    const product = await Product.findById(item.productId._id);
                    if (product.quantity >= item.quantity) {
                        product.quantity -= item.quantity;
                        await product.save();
                    } else {
                        return res.status(400).json({
                            success: false,
                            message: `Not enough stock for product: ${product.productName}`,
                        });
                    }
                }
                await Cart.deleteOne({ userId });
            }

            return res.status(200).json({
                success: true,
                message: "Payment verified and order placed successfully",
            });
        } else {
            // Payment failure
            order.paymentStatus = "Pending";
            order.status = "Pending";
            
            await order.save();
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Payment verification encountered an error" });
    }
};








const retryRazorpayPayment = async (req, res) => {
    const { orderId } = req.params; 
    console.log("orderid",orderId);
    const userId = req.session.user._id;

    try {
        const order = await Order.findOne({ orderId, userId });
        console.log("ordered",order);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.paymentStatus === 'Paid') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        const response = {
            success: true,
            order: {
                id: order.razorpayOrderId,
                amount: order.finalAmount * 100, 
                key: process.env.RAZORPAY_KEY_ID, 
            },
        };

        console.log("response",response);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Retry Razorpay Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



module.exports = { createRazorpayOrder,
    verifyRazorpayPayment,
    retryRazorpayPayment,
 };




