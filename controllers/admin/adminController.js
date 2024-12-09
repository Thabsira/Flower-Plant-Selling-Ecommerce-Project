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



/*const getDashboardSalesData = async (req, res) => {
    try {
      const { reportType = "yearly" } = req.query;
  
      let start, end;
      if (reportType === "yearly") {
        start = moment().startOf("year").toDate();
        end = moment().endOf("year").toDate();
      } else if (reportType === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
      }
  
      // Aggregate sales data by month
      const salesData = await Order.aggregate([
        {
          $match: {
            createdOn: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $month: "$createdOn" },
            totalSales: { $sum: "$finalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id": 1 }, // Sort by month
        },
      ]);
  
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching dashboard sales data:", error);
      res.status(500).send("Internal Server Error");
    }
  };*/


//working
  /*const getDashboardSalesData = async (req, res) => {
    try {
      const { reportType = "yearly" } = req.query;
  
      let start, end;
      if (reportType === "yearly") {
        start = moment().startOf("year").toDate();
        end = moment().endOf("year").toDate();
      } else if (reportType === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
      }
  
      // Aggregate sales data by month
      const salesData = await Order.aggregate([
        {
          $match: {
            createdOn: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $month: "$createdOn" },
            totalSales: { $sum: "$finalAmount" },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id": 1 }, // Sort by month
        },
      ]);
  
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching dashboard sales data:", error);
      res.status(500).send("Internal Server Error");
    }
  };*/




  /*const getDashboardSalesData = async (req, res) => {
    try {
      const { reportType = "yearly" } = req.query;
  
      let start, end;
      if (reportType === "yearly") {
        start = moment().startOf("year").toDate();
        end = moment().endOf("year").toDate();
      } else if (reportType === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
      }
  
      // Aggregate sales data by month
      const salesData = await Order.aggregate([
        {
          $match: {
            createdOn: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $month: "$createdOn" },
            totalSales: { $sum: "$finalAmount" }, // Total Sales
            netSales: { $sum: { $subtract: ["$finalAmount", "$discount"] } }, // Example of Net Sales (after discount)
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id": 1 }, // Sort by month
        },
      ]);
  
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching dashboard sales data:", error);
      res.status(500).send("Internal Server Error");
    }
  };*/



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
  
      // Aggregate sales data by month or week
      const salesData = await Order.aggregate([
        {
          $match: {
            createdOn: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: reportType === "weekly" ? { $week: "$createdOn" } : { $month: "$createdOn" }, // Use week for weekly report
            totalSales: { $sum: "$finalAmount" },
            netSales: { $sum: { $subtract: ["$finalAmount", "$discount"] } }, // Net sales after discount
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id": 1 }, // Sort by week or month
        },
      ]);
  
      res.json(salesData);
    } catch (error) {
      console.error("Error fetching dashboard sales data:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  



  /*const  getDashboardSalesData = async (req, res) => {
    try {
      let { startDate, endDate, reportType } = req.query;
  
      if (!reportType) {
        reportType = "weekly";
      }
  
      let start, end;
  
      if (reportType === "weekly") {
        start = moment().startOf("week").toDate();
        end = moment().endOf("week").toDate();
      } else if (reportType === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
      } else if (reportType === "yearly") {
        start = moment().startOf("year").toDate();
        end = moment().endOf("year").toDate();
      } else if (reportType === "custom" && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      }
  
      const allOrders = await Order.find({
        createdOn: { $gte: start, $lte: end },
      }).populate("orderItems.product");
  
      // Aggregating data for the chart (sales over time)
      let salesData = [];
      let labels = [];
  
      allOrders.forEach((order) => {
        const orderDate = moment(order.createdOn).format('YYYY-MM-DD');
        if (!labels.includes(orderDate)) {
          labels.push(orderDate);
          salesData.push(order.totalPrice);
        } else {
          const index = labels.indexOf(orderDate);
          salesData[index] += order.totalPrice;
        }
      });
  
      res.render('dashboard', {
        salesData,
        labels,
        reportType,
      });
    } catch (error) {
      console.error("Error generating sales data for chart:", error);
      res.status(500).send("Internal Server Error");
    }
  };*/



  /*const getDashboard = async (req, res) => {
    try {
      // Extract query parameters for filters (optional, for flexibility)
      let { reportType = "weekly", startDate, endDate } = req.query;
  
      let start, end;
  
      // Determine the date range based on the report type
      if (reportType === "weekly") {
        start = moment().startOf("week").toDate();
        end = moment().endOf("week").toDate();
      } else if (reportType === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
      } else if (reportType === "yearly") {
        start = moment().startOf("year").toDate();
        end = moment().endOf("year").toDate();
      } else if (reportType === "custom" && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      }
  
      // Fetch orders within the selected date range
      const orders = await Order.find({
        createdOn: { $gte: start, $lte: end },
      }).populate("orderItems.product");
  
      // Initialize chart data variables
      const salesData = [];
      const netSalesData = [];
      const labels = [];
  
      // Group data by week, month, or custom range
      const groupedData = {};
      orders.forEach((order) => {
        const key =
          reportType === "weekly"
            ? moment(order.createdOn).startOf("week").format("YYYY-MM-DD")
            : reportType === "monthly"
            ? moment(order.createdOn).startOf("month").format("YYYY-MM")
            : moment(order.createdOn).format("YYYY"); // Yearly or custom
  
        if (!groupedData[key]) {
          groupedData[key] = { totalSales: 0, netSales: 0 };
        }
  
        groupedData[key].totalSales += order.totalPrice;
        groupedData[key].netSales +=
          order.totalPrice - (order.discount || 0) - order.orderItems.reduce((sum, item) => {
            const regularPrice = item.product.regularPrice;
            const discountedPrice = item.price;
            return sum + (regularPrice - discountedPrice) * item.quantity;
          }, 0);
      });
  
      // Prepare chart data arrays
      for (const [key, value] of Object.entries(groupedData)) {
        labels.push(key);
        salesData.push(value.totalSales);
        netSalesData.push(value.netSales);
      }
  
      // Respond with data for rendering or API consumption
      res.render("dashboard", {
        labels,
        salesData,
        netSalesData,
        reportType,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error("Error generating dashboard data:", error);
      res.status(500).send("Internal Server Error");
    }
  };*/



  /*const getDashboard = async (req, res) => {
    try {
      // Extract query parameters for filters (optional, for flexibility)
      let { reportType = "weekly", startDate, endDate } = req.query;
  
      let start, end;
  
      // Determine the date range based on the report type
      if (reportType === "weekly") {
        start = moment().startOf("week").toDate();
        end = moment().endOf("week").toDate();
      } else if (reportType === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
      } else if (reportType === "yearly") {
        start = moment().startOf("year").toDate();
        end = moment().endOf("year").toDate();
      } else if (reportType === "custom" && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
      }
  
      // Fetch orders within the selected date range
      const orders = await Order.find({
        createdOn: { $gte: start, $lte: end },
      }).populate("orderItems.product");
  
      // Initialize chart data variables
      const salesData = [];
      const netSalesData = [];
      const labels = [];
  
      // Group data by week, month, or custom range
      const groupedData = {};
      orders.forEach((order) => {
        const key =
          reportType === "weekly"
            ? moment(order.createdOn).startOf("week").format("YYYY-MM-DD")
            : reportType === "monthly"
            ? moment(order.createdOn).startOf("month").format("YYYY-MM")
            : moment(order.createdOn).format("YYYY"); // Yearly or custom
  
        if (!groupedData[key]) {
          groupedData[key] = { totalSales: 0, netSales: 0 };
        }
  
        groupedData[key].totalSales += order.totalPrice;
        groupedData[key].netSales +=
          order.totalPrice - (order.discount || 0) - order.orderItems.reduce((sum, item) => {
            const regularPrice = item.product.regularPrice;
            const discountedPrice = item.price;
            return sum + (regularPrice - discountedPrice) * item.quantity;
          }, 0);
      });
  
      // Prepare chart data arrays
      for (const [key, value] of Object.entries(groupedData)) {
        labels.push(key);
        salesData.push(value.totalSales);
        netSalesData.push(value.netSales);
      }
  
      // Respond with data for rendering or API consumption
      res.render("dashboard", {
        labels: JSON.stringify(labels),
        salesData: JSON.stringify(salesData),
        netSalesData: JSON.stringify(netSalesData),
        reportType,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error("Error generating dashboard data:", error);
      res.status(500).send("Internal Server Error");
    }
  };*/



  /*const getDashboard = async (req, res) => {
    try {
      // Extract query parameters
      let { reportType = "weekly", startDate, endDate } = req.query;
  
      // Determine the date range for filtering
      let start, end, labelsFormat;
      if (reportType === "weekly") {
        start = moment().startOf("week").toDate();
        end = moment().endOf("week").toDate();
        labelsFormat = "ddd"; // Weekdays (e.g., Mon, Tue)
      } else if (reportType === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("month").toDate();
        labelsFormat = "D MMM"; // Dates in the month (e.g., 1 Dec, 2 Dec)
      } else if (reportType === "yearly") {
        start = moment().startOf("year").toDate();
        end = moment().endOf("year").toDate();
        labelsFormat = "MMM"; // Months (e.g., Jan, Feb)
      } else if (reportType === "custom" && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        labelsFormat = "D MMM YYYY"; // Custom range
      }
  
      // Fetch orders within the selected date range
      const orders = await Order.find({
        createdOn: { $gte: start, $lte: end },
      }).populate("orderItems.product");
  
      // Process data for chart
      const groupedData = {};
      orders.forEach((order) => {
        const key = moment(order.createdOn).format(labelsFormat);
        if (!groupedData[key]) {
          groupedData[key] = { totalSales: 0, netSales: 0 };
        }
        groupedData[key].totalSales += order.totalPrice;
        groupedData[key].netSales +=
          order.totalPrice - (order.discount || 0) -
          order.orderItems.reduce((sum, item) => {
            const regularPrice = item.product.regularPrice;
            const discountedPrice = item.price;
            return sum + (regularPrice - discountedPrice) * item.quantity;
          }, 0);
      });
  
      // Prepare chart data
      const labels = Object.keys(groupedData);
      const salesData = labels.map((key) => groupedData[key].totalSales);
      const netSalesData = labels.map((key) => groupedData[key].netSales);
  
      // Render dashboard with filters and chart data
      res.render("dashboard", {
        labels: JSON.stringify(labels),
        salesData: JSON.stringify(salesData),
        netSalesData: JSON.stringify(netSalesData),
        reportType,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error("Error generating dashboard data:", error);
      res.status(500).send("Internal Server Error");
    }
  };*/





  const getTopSellingProducts = async (req, res) => {
    try {
      // Aggregate the total quantity sold per product by going through all orders
      const topSellingProducts = await Order.aggregate([
        { $unwind: "$orderItems" },  // Unwind the orderItems array
        { $group: {
          _id: "$orderItems.product",  // Group by product
          totalQuantitySold: { $sum: "$orderItems.quantity" }  // Sum the quantity sold
        }},
        { $sort: { totalQuantitySold: -1 } },  // Sort by total quantity sold (descending)
        { $limit: 10 },  // Limit the result to top 10 products
        { $lookup: {  // Lookup product details
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }},
        { $unwind: "$productDetails" },  // Unwind the product details
        { $project: {
          _id: 0,
          productId: "$_id",
          productName: "$productDetails.productName",
          productImage: { $arrayElemAt: ["$productDetails.productImage", 0] },  // Get the first image
          totalQuantitySold: 1
        }}
      ]);
  
      res.json(topSellingProducts);  // Send the top-selling products as a response
    } catch (error) {
      console.error("Error fetching top-selling products:", error);
      res.status(500).send("Server error");
    }
  };





  /*const getTopCategories = async (req, res) => {
    try {
      // Aggregate to get the total quantity sold per category
      const topCategories = await Order.aggregate([
        { $unwind: "$orderItems" }, // Unwind the orderItems array to get individual items
        { $lookup: {
          from: "products", 
          localField: "orderItems.product", 
          foreignField: "_id", 
          as: "product"
        }},
        { $unwind: "$product" }, // Unwind the product data to get product details
        { $group: {
          _id: "$product.category", // Group by category of the product
          totalQuantity: { $sum: "$orderItems.quantity" }, // Sum total quantity of products ordered
        }},
        { $sort: { totalQuantity: -1 } }, // Sort by total quantity sold (descending)
        { $limit: 10 }, // Limit to the top 10 categories
        { $lookup: {
          from: "categories", 
          localField: "_id", 
          foreignField: "_id", 
          as: "categoryDetails"
        }},
        { $unwind: "$categoryDetails" }, // Unwind to get category details
        { $project: {
          name: "$categoryDetails.name", // Only select category name
          totalQuantity: 1 // Select total quantity sold
        }}
      ]);
  
      // Send the result back as a JSON response
      res.json({ categories: topCategories });
    } catch (error) {
      console.error("Error fetching top categories:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };*/



  const getTopSellingCategories = async (req, res) => {
    try {
      // Aggregate order items to get total sales per category
      const topCategories = await Order.aggregate([
        { $unwind: "$orderItems" },  // Flatten the orderItems array
        { 
          $lookup: {
            from: "products",  // Join with the Product collection
            localField: "orderItems.product",  // Field in Order schema
            foreignField: "_id",  // Field in Product schema
            as: "product"  // Alias for the result of the join
          }
        },
        { $unwind: "$product" },  // Flatten the product data
        { $group: {  // Group by category to sum the total sales
          _id: "$product.category",
          totalSales: { $sum: "$orderItems.quantity" }
        }},
        { 
          $lookup: {  // Join with the Category collection to get category names
            from: "categories",  // Category collection
            localField: "_id",  // Reference to Category _id
            foreignField: "_id",  // Reference to Category _id
            as: "category"  // Alias for the result of the join
          }
        },
        { $unwind: "$category" },  // Flatten the category data
        { 
          $project: {  // Project the necessary fields
            categoryName: "$category.name",
            totalSales: 1
          }
        },
        { $sort: { totalSales: -1 } },  // Sort by total sales in descending order
        { $limit: 10 }  // Limit the result to top 10 categories
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
    
}
