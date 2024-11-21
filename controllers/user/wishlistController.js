const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");
const Wishlist = require("../../models/wishlistSchema");


const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.query.productId;

        let wishlist = await Wishlist.findOne({ userId });
        if (wishlist && wishlist.products.some(item => item.productId.toString() === productId)) {
            return res.json({ success: false, message: 'Item is already in wishlist' });
        }
        if (!wishlist) {
            wishlist = new Wishlist({
                userId,
                products: [{ productId }]
            });
        } else {
        
            wishlist.products.push({ productId });
        }

        await wishlist.save();
        res.json({ success: true, message: 'Item added to wishlist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};




const getWishlistPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const wishlist = await Wishlist.findOne({ userId }).populate('products.productId');
        
        res.render('wishlist', { wishlist });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading wishlist');
    }
};




const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.query.productId;

        await Wishlist.findOneAndUpdate(
            { userId },
            { $pull: { products: { productId } } },
            { new: true }
        );

        res.json({ success: true, message: 'Item removed from wishlist' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};










module.exports={
    addToWishlist,
    getWishlistPage,
    removeFromWishlist,
}