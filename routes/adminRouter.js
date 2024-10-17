const express = require('express');
const router = express.Router();
const adminController= require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const productController = require("../controllers/admin/productController")
const customerController=require("../controllers/admin/customerController");
const {userAuth,adminAuth} = require("../middlewares/auth");
const path = require('path');



const multer = require('multer');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder for uploaded images
        cb(null, path.join(__dirname, "../public/uploads/product-images"));
          // Change to match your folder structure
          console.log('uploaded');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded files
        cb(null, Date.now() + '-' + file.originalname);
    }
});



const uploads = multer({ storage: storage });


 

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
router.post("/addCategoryOffer",adminAuth,categoryController.addCategoryOffer);
router.post("/removeCategoryOffer",adminAuth,categoryController.removeCategoryOffer);
router.get("/listCategory",adminAuth,categoryController.getListCategory);
router.get("/unlistCategory",adminAuth,categoryController.getUnlistCategory);
router.get("/editCategory",adminAuth,categoryController.getEditCategory);
router.post("/editCategory/:id",adminAuth,categoryController.editCategory);

//Product management

router.get("/addProducts",adminAuth,productController.getProductAddPage);
router.post("/addProducts", adminAuth,uploads.array("images",4),productController.addProducts);
router.get("/products",adminAuth,productController.getAllProducts);







module.exports = router;
