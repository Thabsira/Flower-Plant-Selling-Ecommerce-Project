const express=require("express");
const router=express.Router();
const passport = require('passport');
const userController= require("../controllers/user/userController");
const profileController = require("../controllers/user/profileController");
const userprofileController = require("../controllers/user/userprofileController");
const cartController = require("../controllers/user/cartController")
const checkoutController = require("../controllers/user/checkoutController");
const orderController = require("../controllers/user/orderController");
const productController = require("../controllers/user/productControllers");
const wishlistController = require("../controllers/user/wishlistController");
const razorpayController = require("../controllers/user/razorpayController");
const orderDetailsController = require("../controllers/user/orderDetailsController");
//const walletController = require("../controllers/user/walletController");
const {userAuth,adminAuth} = require("../middlewares/auth");
/*const paymentController = require('../controllers/user/paymentController');

router.post('/verify-payment',userAuth, paymentController.verifyPayment);*/
router.use((req,res,next)=>{
    console.log("current roter request",req.url);
    console.log('router request method',req.method);
    next()
})

router.get("/pageNotFound",userController.pageNotFound)
router.get('/',userController.loadHomepage);
router.get('/signup',userController.loadSignup);
router.post('/signup', userController.signup);
router.post("/verify-otp",userController.verifyOtp);
router.post('/resend-otp',userController.resendOtp)

router.get('/auth/google',passport.authenticate('google',{scope:["profile","email"]}));

router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    req.session.user = req.user;
   // req.session.userId = req.user._id;       // Stores userId in session
    req.session.username = req.user.username; // Stores username in session
    res.redirect('/')
   //console.log('user logged in',req.user);
// req.session.user=req.user._id
});

router.get('/login', userController.loadLogin);
router.post("/login",userController.login);

router.get("/logout",userController.logout);

router.get("/productDetails",userController.productDetails);

// forgot pass

router.get("/forgot-password",profileController.getForgotPassPage);
router.post('/forgot-email-valid',profileController.forgotEmailValid);
router.post("/verify-passForgot-otp",profileController.verifyForgotPassOtp);
router.get("/reset-password",profileController.getResetPassPage);
router.post('/resend-forgot-otp',profileController.resendOtp);
router.post('/reset-password',profileController.postNewPassword);

//userprofile
/*const ensureAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).send('User not authenticated');
    }
    next(); // User is authenticated, proceed
};*/



router.get("/userProfile",userAuth,userprofileController.getUserProfile);
router.get("/profile/edit-profile",userAuth,userprofileController.geteditProfilePage);
router.post("/profile/update", userAuth, userprofileController.updateUserProfile); 


//address

router.get("/profile/address/add", userAuth, userprofileController.getAddAddressPage);
router.post("/profile/address/add", userAuth, userprofileController.addAddress);
router.get("/profile/address/edit/:id", userAuth, userprofileController.getEditAddressPage);
router.post("/profile/address/edit/:id", userAuth, userprofileController.updateAddress);
router.post("/profile/address/delete/:id", userAuth, userprofileController.deleteAddress);

//cart

router.get("/cart",userAuth,cartController.getCartPage);
router.post("/cart/add", userAuth, cartController.addToCart);
router.get("/cart", userAuth, cartController.listCartItems);
router.delete('/cart/remove/:productId', cartController.removeItemFromCart);
router.post('/cart/update', userAuth, cartController.updateCartItem);
router.get('/cart/count', userAuth, cartController.getCartCount);

//checkout

router.get("/checkout",userAuth,checkoutController.getCheckoutPage);
router.post('/checkout/place-order',userAuth, checkoutController.placeOrder);

//order

router.get("/orders/history",userAuth,orderController.getOrderHistory);

//product


router.get('/products',userAuth, productController.getProductPage);

//router.get('/products/:productId',userAuth, productController.productDetails);

//router.get('/products/search-suggestions',userAuth,productController.getSearchSuggestions);

router.get('/products/search-suggestions', (req, res, next) => {
    console.log('User Auth middleware triggered');
    next(); 
}, productController.getSearchSuggestions);


//router.get('/productDetails/:productId',userAuth,userController.productDetails);


//router.post('/verify-payment',userAuth, checkoutController.verifyPayment);


//wishlist
router.get('/wishlist/add',userAuth, wishlistController.addToWishlist);
router.get('/wishlist',userAuth, wishlistController.getWishlistPage);
router.delete('/wishlist/remove',userAuth,wishlistController.removeFromWishlist);
//router.post('/wishlist/move-to-cart', userAuth, wishlistController.moveToCart);
// In wishlistRoutes.js
//router.post('/wishlist/move-to-cart',userAuth, wishlistController.moveToCart);
router.post('/wishlist/move-to-cart', userAuth, wishlistController.moveToCart);
router.get('/wishlist/count',userAuth, wishlistController.getWishlistCount);


//router.post('/cart/apply-coupon',userAuth,cartController.applyCoupon);


//order

router.post("/orders/cancel/:orderId",userAuth, orderController.cancelOrder);
router.post('/orders/return/:orderId',userAuth, orderController.returnOrder);




router.post('/create-order',userAuth, razorpayController.createRazorpayOrder); // Create Razorpay order
router.post('/verify-payment',userAuth, razorpayController.verifyRazorpayPayment); // Verify Razorpay payment

router.post('/apply-coupon',userAuth,checkoutController.applyCoupon);
router.post('/remove-coupon',userAuth,checkoutController.removeCoupon);

//router.get('/wallet',userAuth, walletController.getWalletDetails);

router.get("/wallet",userAuth,userController.loadWalletPage);


router.get('/order/:orderId',userAuth, orderDetailsController.getOrderDetails);
router.get('/order-confirm',userAuth,checkoutController.orderconfirm);
router.post('/retry-payment/:orderId',userAuth,razorpayController.retryRazorpayPayment);






module.exports=router;

