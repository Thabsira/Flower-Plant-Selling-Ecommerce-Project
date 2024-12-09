const Address = require("../../models/addressSchema");
const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Order = require("../../models/orderSchema");
const Wallet = require("../../models/walletSchema");
const Coupon = require("../../models/couponSchema");
const { default: mongoose } = require("mongoose");


const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })
            .populate('orderItems.product', 'productName productImage salePrice description couponApplied couponCode') // Populate product details
           .populate('address') // Populate address details
           /*.populate({
            path: 'address',
            model: 'Address',
            populate: {
                path: 'address',  // Populating the array inside the address field
                model: 'Address'
            }
        })*/

           /* .populate({
                path: 'address', // Populate the address field
                model: 'Address', // Model to populate from
                populate: {
                    path: 'address', // Populate the 'address' array within the address document
                }
            });*/
        

            console.log("oreder",order);
            

        if (!order) {
            return res.status(404).send('Order not found');
        }

        res.render('order-details', { order
         });
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getOrderDetails,
};