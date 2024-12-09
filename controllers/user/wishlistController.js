const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");
const Wishlist = require("../../models/wishlistSchema");




const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        console.log('userId:', userId);
        const productId = req.query.productId;
        console.log('productId:', productId);

        let wishlist = await Wishlist.findOne({ userId });
        console.log('Current wishlist:', wishlist);

        if (!wishlist) {
            wishlist = new Wishlist({ 
                userId, 
                products: [{ productId, addedOn: new Date() }] 
            });
        } else {
            const isProductInWishlist = wishlist.products.some(
                item => item.productId.toString() === productId
            );

            if (isProductInWishlist) {
                return res.json({ success: false, message: 'Item is already in wishlist' });
            }

            wishlist.products.push({ productId, addedOn: new Date() });
        }
        await wishlist.save();
        console.log('Updated wishlist:', wishlist);

        res.json({ success: true, message: 'Item added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
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


const moveToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.user ? req.session.user._id : null;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(400).json({ message: "Product not found" });
        }

        if (product.status !== "Available" || product.quantity < quantity) {
            return res.status(400).json({ message: "Product not available or insufficient stock" });
        }

        // Add product to cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex === -1) {
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice,
                totalPrice: quantity * product.salePrice,
            });
            await cart.save();
        }

        // Remove product from wishlist
        await Wishlist.updateOne(
            { userId },
            { $pull: { items: { productId } } }
        );

        res.status(200).json({ message: "Item added to cart and removed from wishlist" });
    } catch (error) {
        console.error("Error moving item to cart:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const getWishlistCount = async (req, res) => {
    try {
        const userId = req.session.user._id;
        console.log('userId:',userId)
        if (!userId) {
            return res.json({ count: 0 });
        }

        const wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            console.log(`No wishlist found for userId: ${userId}`);
            return res.json({ count: 0 });
        }
        console.log('wishlist',wishlist)
       // Count items in the wishlist
       const count = wishlist && wishlist.products ? wishlist.products.length : 0;

       console.log("count:",count);

        await wishlist.save();

        res.json({ count });
    } catch (error) {
        console.error(error);
        console.log(error)
        res.status(500).json({ error: "Failed to fetch wishlist count" });
    }
};







module.exports={
    addToWishlist,
    getWishlistPage,
    removeFromWishlist,
    moveToCart,
    getWishlistCount,
}