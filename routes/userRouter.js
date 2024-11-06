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
const {userAuth,adminAuth} = require("../middlewares/auth");


router.get("/pageNotFound",userController.pageNotFound)
router.get('/',userController.loadHomepage);
router.get('/signup',userController.loadSignup);
router.post('/signup', userController.signup);
router.post("/verify-otp",userController.verifyOtp);
router.post('/resend-otp',userController.resendOtp)

router.get('/auth/google',passport.authenticate('google',{scope:["profile","email"]}));

router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    //req.session.user = req.user;
    req.session.userId = req.user._id;       // Stores userId in session
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

//checkout

router.get("/checkout",userAuth,checkoutController.getCheckoutPage);
router.post('/checkout/place-order',userAuth, checkoutController.placeOrder);

//order

router.get("/orders/history",userAuth,orderController.getOrderHistory);

//product

router.get('/products',userAuth, productController.getProductPage);





module.exports=router;

