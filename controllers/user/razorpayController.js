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


/*const createRazorpayOrder = async (req, res) => {
    const { addressId } = req.body;
    const userId = req.session.user._id;

    try {
    
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || !cart.items.length) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

       // const amount = /cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
       const amount=req.session.totalAfterCoupon+3 || req.session.finalAmount+3;
        const orderOptions = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                addressId: addressId,
               // couponCode: req.session.couponCode || "No coupon",
                couponCode: req.session.couponCode || "No coupon",
               // discount: discount.toFixed(2), // Pass discount for later use

            }
        };

        console.log("order options", orderOptions);

        razorpay.orders.create(orderOptions, (err, order) => {
            if (err) {
                console.error('Error creating Razorpay order:', err);
                return res.status(500).json({ success: false, message: 'Error creating Razorpay order' });
            }

            res.json({
                success: true,
                order: {
                    id: order.id,
                    amount: order.amount+3,
                    key: process.env.RAZORPAY_KEY_ID  
                }
            });
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Error creating order' });
    }
};*/









//working
/*const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, addressId } = req.body;

        console.log("Received Request Body:", req.body);

        
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
            .update(body)
            .digest("hex");

        console.log("Expected Signature:", expectedSignature);
        console.log("Received Signature:", razorpay_signature);

        if (expectedSignature !== razorpay_signature) {
            console.error("Invalid Signature Detected");
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        console.log("Signature verified successfully!");
        

        const cart = await Cart.findOne({ userId: req.session.user._id }).populate("items.productId");

        if (!cart || !cart.items.length) {
            console.error("Cart is empty or not found");
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

       // const totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
       //const totalPrice = req.session.totalAfterCoupon || req.session.finalAmount;
      // console.log("total price",totalPrice);

      const finalAmount = req.session.totalAfterCoupon+3 || req.session.finalAmount+3;
      const discount = req.session.finalAmount - req.session.totalAfterCoupon || 0;




        const address = await Address.findOne({address:{$elemMatch:{_id:addressId}}}).lean()
       
        console.log("address",address);

        if (!address || address.length === 0) {
            console.error("Address not found");
            return res.status(400).json({ success: false, message: "Address not found" });
        }

        console.log("Address fetched successfully:", address);
        const newOrder = new Order({
            userId: req.session.user._id,
            orderItems: cart.items.map((item) => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price,
            })),
            //discount: discount,
            //finalAmount: totalPrice,
            totalPrice: req.session.finalAmount+3, // Original total before discount
            discount, // Store the discount applied
            finalAmount, // Store the discounted total
            address: address,
            status: "Processing",
            paymentMethod: "Razorpay",
            paymentStatus: "Paid", 
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            couponApplied: req.session.couponCode || null,
        });
        await newOrder.save();

       for (const item of cart.items) {
            const product = await Product.findById(item.productId._id);
            if (product) {
                // Make sure there's enough stock before reducing
                if (product.quantity >= item.quantity) {
                    product.quantity -= item.quantity;
                    await product.save();
                } else {
                    console.error(`Not enough stock for product: ${product.productName}`);
                    return res.status(400).json({ success: false, message: `Not enough stock for product: ${product.productName}` });
                }
            }
        }



        await Cart.deleteOne({ userId: req.session.user._id });

        console.log("Order created successfully:", newOrder);
        return res.status(200).json({ success: true, message: "Payment verified and order placed" });
    } catch (error) {
        console.error("Error during payment verification:", error);
        return res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};*/











const createRazorpayOrder = async (req, res) => {
    const { addressId } = req.body;
    const userId = req.session.user._id;

    try {
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart || !cart.items.length) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const amount = req.session.totalAfterCoupon + 3 || req.session.finalAmount + 3;
        const discount = req.session.finalAmount - req.session.totalAfterCoupon || 0;


        const address = await Address.findOne({address:{$elemMatch:{_id:addressId}}}).lean()
       
        console.log("address",address);

        if (!address || address.length === 0) {
            console.error("Address not found");
            return res.status(400).json({ success: false, message: "Address not found" });
        }

        console.log("Address fetched successfully:", address);

        // Create the order in the database with paymentStatus: "Pending"
        const newOrder = new Order({
            userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price,
            })),
            totalPrice: req.session.finalAmount + 3,
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
                    amount: order.amount + 3,
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

            // Update product quantities and clear the cart
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
    const { orderId } = req.params; // Retrieve orderId from URL
    console.log("orderid",orderId);
    const userId = req.session.user._id; // Logged-in user's ID

    try {
        // Step 1: Find the order in the database
        const order = await Order.findOne({ orderId, userId });
        console.log("ordered",order);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.paymentStatus === 'Paid') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        // Step 2: Send Razorpay order details to the frontend
        const response = {
            success: true,
            order: {
                id: order.razorpayOrderId, // Existing Razorpay order ID
                amount: order.finalAmount * 100, // Amount in paise
                key: process.env.RAZORPAY_KEY_ID, // Razorpay API Key
            },
        };

        console.log("response",response);

        return res.status(200).json(response);
    } catch (error) {
        console.error('Retry Razorpay Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};





/*const retryRazorpayPayment = async (req, res) => {
    const { OrderId } = req.params; 
    const userId = req.session.user._id; 

    try {
        // Fetch the order details
        const order = await Order.findOne({ OrderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if the order has already been paid
        if (order.paymentStatus === 'Paid') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        // Return Razorpay order details for retry
        return res.status(200).json({
            success: true,
            order: {
                id: order.razorpayOrderId,
                amount: order.finalAmount * 100, // Convert to paise
                key: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error('Error in retrying Razorpay payment:', error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};*/



/*const retryRazorpayPayment = async (req, res) => {
    const { OrderId } = req.params;
    const userId = req.session.user._id;
    console.log("orderid",OrderId);

    try {
        const order = await Order.findOne({ OrderId, userId });
        console.log("orderder",order);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }


        if (order.paymentStatus === "Paid") {
            return res.status(400).json({ success: false, message: "Payment already completed" });
        }

        // Update Razorpay Order ID during retry if necessary
        const razorpayOrderId = order.razorpayOrderId; // Use existing ID or generate a new one

        console.log("razorpayordrid",razorpayOrderId);

        return res.status(200).json({
            success: true,
            order: {
                id: razorpayOrderId,
                amount: order.finalAmount * 100,
                key: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error("Error in retrying Razorpay payment:", error.message);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};*/














module.exports = { createRazorpayOrder,
    verifyRazorpayPayment,
    retryRazorpayPayment,
 };




