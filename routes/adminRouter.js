const express = require('express');
const router = express.Router();
const adminController= require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const customerController=require("../controllers/admin/customerController");
const {userAuth,adminAuth} = require("../middlewares/auth");
 

router.get("/pageerror",adminController.pageerror);

//login management
router.get("/login", adminController.loadLogin);
router.post('/login',adminController.login);
router.get('/dashboard',adminAuth,adminController.loadDashboard);
router.get("/logout",adminController.logout);

//customer management

router.get("/users",adminAuth,customerController.customerInfo);
router.get("/blockCustomer",adminAuth,customerController.customerBlocked);
router.get("/unblockCustomer",adminAuth,customerController.customerunBlocked);

//category management

router.get("/category",adminAuth,categoryController.categoryInfo);
router.post("/addCategory",adminAuth,categoryController.addCategory);




module.exports = router;
