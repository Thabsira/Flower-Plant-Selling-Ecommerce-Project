const User = require("../../models/userSchema");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const moment = require("moment");
const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");

const pageerror = async(req,res)=>{
    res.render("admin-error")
}


const loadLogin = (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render("admin-login", { message: null });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, isAdmin: true });

        if (!admin) {
            return res.render('admin-login', { message: "Admin not found" });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.render('admin-login', { message: "Incorrect password" });
        }

        req.session.admin = {
            _id: admin._id,
            email: admin.email,
        };

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.log("Login error:", error);
        res.redirect("/pageerror");
    }
};

const loadDashboard = async (req, res) => {
    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }
    try {
        res.render("dashboard");
    } catch (error) {
        res.redirect("/pageerror");
    }
};


const logout = async(req,res)=>{
    try{
        req.session.destroy(err=>{
           if(err){
            console.log("Error in destroying session");
            return res.redirect("/pageerror")
           } 
           res.redirect("/admin/login");
        })
    }catch(error){
        console.log("unexpected error during logout",error);
        res.redirect('/pageerror');
    }
}




  const getDashboardSalesData = async (req, res) => {
    try {
      const { reportType = "yearly" } = req.query;
  
      let start, end;
      if (reportType === "yearly") {
        start = moment().startOf("year").toDate();
        end = moment().endOf("year").toDate();
      } else if (reportType === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
      } else if (reportType === "weekly") {
        start = moment().startOf("week").toDate();
        end = moment().endOf("week").toDate();
      }
  
      const salesData = await Order.aggregate([
        {
          $match: {
            createdOn: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: reportType === "weekly" ? { $week: "$createdOn" } : { $month: "$createdOn" },
            totalSales: { $sum: "$finalAmount" },
            netSales: { $sum: { $subtract: ["$finalAmount", "$discount"] } },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id": 1 }, 
        },
      ]);
  
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching dashboard sales data:", error);
      res.status(500).send("Internal Server Error");
    }
  };





 
  



  const getTopSellingProducts = async (req, res) => {
    try {
  
      const topSellingProducts = await Order.aggregate([
        { $unwind: "$orderItems" }, 
        { $group: {
          _id: "$orderItems.product", 
          totalQuantitySold: { $sum: "$orderItems.quantity" }  
        }},
        { $sort: { totalQuantitySold: -1 } }, 
        { $limit: 10 }, 
        { $lookup: { 
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }},
        { $unwind: "$productDetails" }, 
        { $project: {
          _id: 0,
          productId: "$_id",
          productName: "$productDetails.productName",
          productImage: { $arrayElemAt: ["$productDetails.productImage", 0] }, 
          totalQuantitySold: 1
        }}
      ]);
  
      res.json(topSellingProducts); 
    } catch (error) {
      console.error("Error fetching top-selling products:", error);
      res.status(500).send("Server error");
    }
  };





  

  const getTopSellingCategories = async (req, res) => {
    try {
      const topCategories = await Order.aggregate([
        { $unwind: "$orderItems" },  
        { 
          $lookup: {
            from: "products",  
            localField: "orderItems.product",
            foreignField: "_id",  
            as: "product"  
          }
        },
        { $unwind: "$product" }, 
        { $group: { 
          _id: "$product.category",
          totalSales: { $sum: "$orderItems.quantity" }
        }},
        { 
          $lookup: { 
            from: "categories",  
            localField: "_id",  
            foreignField: "_id",  
            as: "category"  
          }
        },
        { $unwind: "$category" }, 
        { 
          $project: {  
            categoryName: "$category.name",
            totalSales: 1
          }
        },
        { $sort: { totalSales: -1 } },  
        { $limit: 10 }  
      ]);
  
      res.json(topCategories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching top categories" });
    }
  };
  
  
  
   
  
  
  
  


module.exports={
    loadLogin,
    login,
    loadDashboard,
    pageerror,
    logout,
    getDashboardSalesData,
    getTopSellingProducts,
   // getTopCategories,
   getTopSellingCategories,
   //getSalesReport,
    
}
