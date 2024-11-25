const Razorpay = require('razorpay');
const Address = require("../../models/addressSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});


const createRazorpayOrder = async (req, res) => {
    const { addressId } = req.body;
    const userId = req.session.user._id;

    try {
    
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || !cart.items.length) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

       // const amount = /cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
       const amount=req.session.totalAfterCoupon || req.session.finalAmount;
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
                    amount: order.amount,
                    key: process.env.RAZORPAY_KEY_ID  
                }
            });
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Error creating order' });
    }
};



const verifyRazorpayPayment = async (req, res) => {
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

      const finalAmount = req.session.totalAfterCoupon || req.session.finalAmount;
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
            totalPrice: req.session.finalAmount, // Original total before discount
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
        await Cart.deleteOne({ userId: req.session.user._id });

        console.log("Order created successfully:", newOrder);
        return res.status(200).json({ success: true, message: "Payment verified and order placed" });
    } catch (error) {
        console.error("Error during payment verification:", error);
        return res.status(500).json({ success: false, message: "Payment verification failed" });
    }
};


module.exports = { createRazorpayOrder,
    verifyRazorpayPayment,
 };




