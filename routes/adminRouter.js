const express = require('express');
const router = express.Router();
const adminController= require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const productController = require("../controllers/admin/productController")
const customerController=require("../controllers/admin/customerController");
const orderController = require("../controllers/admin/orderController");
const couponController = require("../controllers/admin/couponController");
const salesReportController = require("../controllers/admin/salesreportController");
const returnController = require("../controllers/admin/returnController");
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

// Route to block category
router.get('/blockCategory',adminAuth, categoryController.blockCategory);

// Route to unblock category
router.get('/unblockCategory',adminAuth, categoryController.unblockCategory);

router.get('/softDeleteCategory',adminAuth, categoryController.softDeleteCategory); // Soft delete a category
router.get('/restoreCategory', adminAuth,categoryController.restoreCategory); // 




//Product management

router.get("/addProducts",adminAuth,productController.getProductAddPage);
router.post("/addProducts", adminAuth,uploads.array("images",4),productController.addProducts);
router.get("/products",adminAuth,productController.getAllProducts);
router.post('/addProductOffer',adminAuth,productController.addProductOffer);
router.post('/removeProductOffer',adminAuth,productController.removeProductOffer);
router.get('/editProduct',adminAuth,productController.getEditProduct);
router.post('/editProduct/:id',adminAuth,uploads.array('images',4),productController.editProduct);
router.post('/deleteImage',adminAuth,productController.deleteSingleImage);
router.get('/blockProduct',adminAuth,productController.blockProduct);
router.get('/unblockProduct',adminAuth,productController.unblockProduct);

//order management

router.get('/orders',adminAuth, orderController.getAllOrders);
router.put('/orders/:orderId/status',adminAuth, orderController.updateOrderStatus);
router.patch('/orders/:orderId/cancel',adminAuth, orderController.cancelOrder);


//coupon management

router.get('/list',adminAuth,couponController.getCouponsList);
router.get("/coupons/create",adminAuth, couponController.showCreateCouponForm);
router.post("/coupons/create",adminAuth,couponController.createCoupon);
router.post('/coupons/delete/:id',adminAuth, couponController.deleteCoupon);
router.get("/coupons/edit/:id",adminAuth, couponController.editCoupon);
router.post("/coupons/edit/:id",adminAuth,couponController.updateCoupon); 

//sales reoprt
router.get('/sales-report',adminAuth,salesReportController.getSalesReport);
//router.get("/sales-report/pdf",adminAuth, salesReportController.downloadPDF);
//router.get('/sales-report/download/pdf',adminAuth, salesReportController.generatePDFReport);
//router.get('/sales-report/download/excel',adminAuth, salesReportController.generateExcelReport);
router.get('/sales-report/download/pdf',adminAuth,salesReportController.downloadSalesReportPDF);



//router.get("/return-request",adminAuth, returnController.getReturnRequests);
router.get("/return-request/:orderId", adminAuth, returnController.getReturnRequests);
//router.post('/returns/:id/decide', adminAuth, returnController.decideReturnRequest);
router.post('/returns/:orderId/decide', adminAuth, returnController.decideReturnRequest);



//router.post("/admin/returns/:orderId/decide",adminAuth, returnController.decideReturnRequest);















module.exports = router;
