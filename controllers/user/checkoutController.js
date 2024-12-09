const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const Coupon = require("../../models/couponSchema");



const getCheckoutPage = async (req, res) => {
    try {
        const userId = req.session.user?._id;
        if (!userId) {
            return res.redirect('/login');
        }

        const userAddressData = await Address.findOne({ userId });
        const addresses = userAddressData ? userAddressData.address : [];

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName productImage salePrice discount',
        });

        if (!cart || cart.items.length === 0) {
            return res.render('checkout', {
                addresses,
                cart: { items: [] },
                subtotal: 0,
                totalDiscount: 0,
                finalAmount: 0,
                couponDiscount: 0,
                totalAfterCoupon: 0,
                couponCode: '',
               // coupons: coupons || [],
            
            });
        }

        
        let subtotal = 0;
        let totalDiscount = 0;
        let finalAmount = 0;

    cart.items.forEach(item => {
    const product = item.productId;

    const itemPrice = typeof product.salePrice === 'number' ? product.salePrice : 0; 
    const itemDiscount = typeof product.discount === 'number' ? product.discount : 0; 
    const itemQuantity = typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1; 

    console.log("Product:", product);
    console.log('Item Quantity:', itemQuantity);
    console.log('Item Price:', itemPrice);
    console.log('Item Discount:', itemDiscount);

    const itemTotal = itemPrice * itemQuantity;
    const discountAmount = itemDiscount * itemQuantity;
    const totalAfterDiscount = itemTotal - discountAmount;

    console.log('Item Total:', itemTotal);
    console.log('Discount Amount:', discountAmount);
    console.log('Total After Discount:', totalAfterDiscount);

    subtotal += itemTotal;
    totalDiscount += discountAmount;
    finalAmount += totalAfterDiscount;

    item.totalPrice = itemTotal;
    item.totalDiscount = discountAmount;
    item.totalAfterDiscount = totalAfterDiscount;
});

console.log('Subtotal:', subtotal);
console.log('Total Discount:', totalDiscount);
console.log('Final Amount:', finalAmount);


req.session.finalAmount = finalAmount;
console.log('Updated session:', req.session); 



       // const coupons = await Coupon.find({});
       const coupons = await Coupon.find({ isActive:true, expireOn: { $gte: new Date() } });
        console.log('Coupons:', coupons);

        let couponDiscount = 0;
        if (req.session.couponCode) {
            const coupon = await Coupon.findOne({ couponCode: req.session.couponCode });

            if (coupon) {
                if (new Date() < new Date(coupon.expireOn)) {
                    if (subtotal >= coupon.minimumPrice) {
                        couponDiscount = coupon.offerPrice || (coupon.discount ? (subtotal * coupon.discount) / 100 : 0);
                    } else {
                        console.log(`Minimum order value for this coupon is ${coupon.minimumPrice}`);
                    }
                } else {
                    console.log('Coupon expired');
                }
            } else {
                console.log('Invalid coupon code');
            }
        }

        const totalAfterCoupon = Math.max(finalAmount - couponDiscount, 0);

        res.render('checkout', {
            addresses,
            cart,
            subtotal,
            finalAmount:req.session.finalAmount,
            totalDiscount,
            couponDiscount,
            totalAfterCoupon,
            coupons: coupons || [],
            couponCode: req.session.couponCode || '',
        });
    } catch (error) {
        console.error('Error loading checkout page:', error);
       // res.status(500).send('Server Error');
         // Ensure fallback response includes coupons
         res.status(500).render('checkout', {
            addresses: [],
            cart: { items: [] },
            subtotal: 0,
            finalAmount: 0,
            totalDiscount: 0,
            couponDiscount: 0,
            totalAfterCoupon: 0,
            couponCode: '',
            coupons: [], 
        });
    }
};





/*const placeOrder = async (req, res) => {
    try {
        console.log("Place order route hit");
        const userId = req.session.user._id;
        const { addressId, paymentMethod, couponCode } = req.body;

        //const singlePayment = Array.isArray(paymentMethod) ? paymentMethod[0]:paymentMethod;
    if (Array.isArray(paymentMethod)) {
        // Take the first value or throw an error
        req.body.paymentMethod = paymentMethod[0];
      }
  

        console.log("Received Address ID:", addressId);
        console.log("Received Payment Method:", paymentMethod);
        console.log("Received Coupon Code:", couponCode);

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const userAddressData = await Address.findOne({ userId });
        const address = userAddressData?.address.find(addr => addr._id.toString() === addressId);

        if (!address) {
            return res.status(400).json({ message: "Address not found" });
        }

        let totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log("Total Price (before discount):", totalPrice);

        for (const item of cart.items) {
            if (item.productId.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${item.productId.productName}`
                });
            }
        }

        let discount = 0;
        let isCouponApplied = false;

        if (couponCode) {
            const coupon = await Coupon.findOne({ couponCode });
            if (!coupon || new Date() > new Date(coupon.expireOn) || !coupon.isList) {
                return res.status(400).json({ message: "Invalid or expired coupon" });
            }


            const appliedCouponCode = req.session.couponCode;
            if (appliedCouponCode === couponCode) {
         return res.status(400).json({ message: "You have already used this coupon" });
               }

        
            if (totalPrice < coupon.minimumPrice) {
                return res.status(400).json({ 
                    message: `Coupon requires a minimum order of $${coupon.minimumPrice}` 
                });
            }

        
            if (coupon.offerPrice && coupon.offerPrice > 0) {
                discount = coupon.offerPrice;
            } else if (coupon.discount && coupon.discount > 0) {
                discount = (totalPrice * coupon.discount) / 100; 
            }

            isCouponApplied = true;
        }

        const finalAmount = Math.max(totalPrice - discount, 0);
        console.log("Discount Applied:", discount);
        console.log("Final Amount (after discount):", finalAmount);

        const order = new Order({
            userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice,
            finalAmount,
            discount,
            address: address._id,
            status: "Pending",
           // paymentMethod:singlePayment,
           paymentMethod:req.body.paymentMethod,
          // paymentStatus: singlePayment === "cash_on_delivery" ? "Pending" : "Paid",
           paymentStatus: paymentMethod === "cash_on_delivery" ? "Pending" : "Paid",
            couponApplied: isCouponApplied,
            couponCode: isCouponApplied ? couponCode : null,
            createdOn: Date.now()
        });

        console.log("Order to be saved:", order);
        await order.save();
        // Clear session values related to coupons and amounts
        delete req.session.couponCode;
        delete req.session.totalAfterCoupon;

// Optionally, clear cart-related session values if any
        delete req.session.cart;

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { quantity: -item.quantity }
            });
        }

        await Cart.deleteOne({ userId });
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: order._id }
        });

        res.redirect('/orders/history');

       //res.json({ success: true, message: 'Order placed successfully!' });
    } catch (error) {
        console.error("Error placing order:", error);
        console.log(error);
        res.status(500).json({ message: "Error placing order" });
    }
};*/



const placeOrder = async (req, res) => {
    try {
        console.log("Place order route hit");
        const userId = req.session.user._id;
        const { addressId, paymentMethod, couponCode } = req.body;

        if (Array.isArray(paymentMethod)) {
            // Take the first value or throw an error
            req.body.paymentMethod = paymentMethod[0];
        }

        console.log("Received Address ID:", addressId);
        console.log("Received Payment Method:", paymentMethod);
        console.log("Received Coupon Code:", couponCode);

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const userAddressData = await Address.findOne({ userId });
        const address = userAddressData?.address.find(addr => addr._id.toString() === addressId);

        if (!address) {
            return res.status(400).json({ message: "Address not found" });
        }

        let totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        console.log("Total Price (before discount):", totalPrice);

        // COD restriction
      /*  if (paymentMethod === req.body.paymentMethod && totalPrice > 1000) {
            console.log("COD restriction triggered: Order total exceeds 1000");
            return res.status(400).json({ 
                message: "Orders above $1000 are not allowed for Cash on Delivery (COD)" 
            });
        }*/

            if (paymentMethod === req.body.paymentMethod) {
                console.log("Payment method is cash on delivery");
            }
            
            if (totalPrice > 1000) {
                console.log("Total price exceeds 1000");
                return res.status(400).json({ 
                    message: "Orders above $1000 are not allowed for Cash on Delivery (COD)" 
                });
                //return res.redirect('/order-confirm');
            }
            

        for (const item of cart.items) {
            if (item.productId.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${item.productId.productName}`
                });
            }
        }

        let discount = 0;
        let isCouponApplied = false;

        if (couponCode) {
            const coupon = await Coupon.findOne({ couponCode });
            if (!coupon || new Date() > new Date(coupon.expireOn) || !coupon.isList) {
                return res.status(400).json({ message: "Invalid or expired coupon" });
            }

            const appliedCouponCode = req.session.couponCode;
            if (appliedCouponCode === couponCode) {
                return res.status(400).json({ message: "You have already used this coupon" });
            }

            if (totalPrice < coupon.minimumPrice) {
                return res.status(400).json({ 
                    message: `Coupon requires a minimum order of $${coupon.minimumPrice}` 
                });
            }

            if (coupon.offerPrice && coupon.offerPrice > 0) {
                discount = coupon.offerPrice;
            } else if (coupon.discount && coupon.discount > 0) {
                discount = (totalPrice * coupon.discount) / 100; 
            }

            isCouponApplied = true;
        }

        const finalAmount = Math.max(totalPrice - discount, 0);
        console.log("Discount Applied:", discount);
        console.log("Final Amount (after discount):", finalAmount);

        const order = new Order({
            userId,
            orderItems: cart.items.map(item => ({
                product: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice,
            finalAmount,
            discount,
            address: address._id,
            status: "Pending",
            paymentMethod: req.body.paymentMethod,
            paymentStatus: paymentMethod === "cash_on_delivery" ? "Paid" : "Pending",
            couponApplied: isCouponApplied,
            couponCode: isCouponApplied ? couponCode : null,
            createdOn: Date.now()
        });

        console.log("Order to be saved:", order);
        await order.save();

        // Clear session values related to coupons and amounts
        delete req.session.couponCode;
        delete req.session.totalAfterCoupon;
        delete req.session.cart;

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.productId._id, {
                $inc: { quantity: -item.quantity }
            });
        }

        await Cart.deleteOne({ userId });
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: order._id }
        });

        res.redirect('/orders/history');

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Error placing order" });
    }
};






const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body; 
        const userId = req.session.user._id;

        console.log("User ID:", userId);
        console.log("Coupon Code:", couponCode);

        if (!userId) {
            return res.status(400).json({ message: "Please login to apply a coupon" });
        }

        const cart = await Cart.findOne({ userId }).populate({
            path: 'items.productId',
            select: 'productName productImage salePrice discount',
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Your cart is empty" });
        }
        console.log("Cart Items:", cart.items);
        const coupon = await Coupon.findOne({ couponCode });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        console.log("Coupon Found:", coupon);
        if (new Date() > new Date(coupon.expireOn)) {
            return res.status(400).json({ message: "Coupon expired" });
        }

        console.log("Coupon Expiry Date:", coupon.expireOn);
        console.log('useridincludes:',coupon.userId);
        console.log("useridtostring:",userId.toString());
        if (coupon.userId.includes(userId.toString())) {
            return res.status(400).json({ message: "You have already used this coupon" });
        }

        const finalAmount = req.session.finalAmount; 
        console.log("Final Amount Before Coupon:", finalAmount);

        if (finalAmount < coupon.minimumPrice) {
            return res.status(400).json({ message: `Coupon requires a minimum order of $${coupon.minimumPrice}` });
        }

        console.log("Coupon Minimum Price:", coupon.minimumPrice);
        let discount = 0;
        if (coupon.offerPrice) {
            discount = coupon.offerPrice;
            console.log("Fixed Offer Price Discount Applied:", discount);
        } else if (coupon.discount) {
            discount = (finalAmount+3 * coupon.discount) / 100; 
            console.log("Percentage Discount Applied:", discount);
        }

        let totalAfterCoupon = finalAmount - discount;
        console.log("Total After Coupon:", totalAfterCoupon);

        req.session.couponCode = couponCode;
        req.session.totalAfterCoupon = totalAfterCoupon; 

        console.log("Updated Session Values:", {
            couponCode: req.session.couponCode,
            totalAfterCoupon: req.session.totalAfterCoupon,
        });
        await Coupon.findOneAndUpdate(
            { couponCode },
            { $push: { userId: userId } } 
        );
        res.json({
            message: "Coupon applied successfully!",
            subtotal: finalAmount,
            couponDiscount: discount,
            totalAfterCoupon: totalAfterCoupon,  
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ message: "Server error" });
    }
};




//  function for removing coupon
const removeCoupon = async (req, res) => {
    try {
        req.session.couponCode = null;
        req.session.totalAfterCoupon = null;

        const userId = req.session.user._id;
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        
        if (!cart || !cart.items.length) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

        res.status(200).json({
            success: true,
            message: "Coupon removed successfully",
            subtotal: subtotal+3,
            discount: 0,
            total: subtotal+3,
        });
    } catch (error) {
        console.error("Error removing coupon:", error);
        res.status(500).json({ success: false, message: "Failed to remove coupon" });
    }
};


const orderconfirm = async(req,res) => {
    res.render('order-confirmation');
}




module.exports = {
    getCheckoutPage,
    placeOrder,
    applyCoupon,
    removeCoupon,
    orderconfirm,
};