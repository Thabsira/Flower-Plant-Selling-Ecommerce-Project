const Order = require("../../models/orderSchema");
const moment = require("moment");




/*const getSalesReport = async (req, res) => {
  try {
    let { startDate, endDate, reportType, page = 1 } = req.query;

    if(!reportType){
      reportType = 'weekly';
    }
    console.log('report type',reportType);
    const limit = 10; 
    const skip = (page - 1) * limit;

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
    } else {
     // return res.status(400).json({ error: "Invalid report type or date range" });
    
    }

    const orders = await Order.find({
      createdOn: { $gte: start, $lte: end },
    })
      .populate("orderItems.product")
      .skip(skip)
      .limit(limit);


    const totalSalesCount = orders.length;
    const overallOrderAmount = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const couponDeduction = orders.reduce((sum, order) => sum + (order.discount || 0), 0);
    const totalOffersApplied = orders.reduce(
      (sum, order) => sum + (order.totalPrice - order.finalAmount),
      0
    );
    const netSales = overallOrderAmount - couponDeduction - totalOffersApplied;
    console.log('total sales count',totalSalesCount);
    console.log('overall order Amount',overallOrderAmount);
    console.log("overall coupon deduction",couponDeduction);
    console.log('total offer applied',totalOffersApplied);

  
    const totalOrders = await Order.countDocuments({
      createdOn: { $gte: start, $lte: end },
    });

    const totalPages = Math.ceil(totalOrders / limit);

    res.render("salesreport", {
      orders,
      totalSalesCount,
      overallOrderAmount,
      couponDeduction,
      netSales,
      totalOffersApplied,
      currentPage: Number(page),
      totalPages,
      startDate,
      endDate,
      reportType,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).send("Internal Server Error");
  }
};*/



const getSalesReport = async (req, res) => {
  try {
    let { startDate, endDate, reportType, page = 1 } = req.query;

    if (!reportType) {
      reportType = "weekly";
    }
    const limit = 10; 
    const skip = (page - 1) * limit;

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

    const orders = await Order.find({
      createdOn: { $gte: start, $lte: end },
    })
      .populate("orderItems.product")
      .skip(skip)
      .limit(limit);

    // Calculations
    const totalSalesCount = orders.length;
    let overallOrderAmount = 0;
    let couponDeduction = 0;
    let totalOffersApplied = 0;

    orders.forEach((order) => {
      overallOrderAmount += order.totalPrice;
      couponDeduction += order.discount || 0;

      // Calculate offer price
      const offerDiscount = order.orderItems.reduce((sum, item) => {
        const regularPrice = item.product.regularPrice;
        const discountedPrice = item.price; // Assuming `item.price` is after the discount
        return sum + (regularPrice - discountedPrice) * item.quantity;
      }, 0);

      totalOffersApplied += offerDiscount;
    });

    const netSales = overallOrderAmount - couponDeduction - totalOffersApplied;

    const totalOrders = await Order.countDocuments({
      createdOn: { $gte: start, $lte: end },
    });

    const totalPages = Math.ceil(totalOrders / limit);

    res.render("salesreport", {
      orders,
      totalSalesCount,
      overallOrderAmount,
      couponDeduction,
      totalOffersApplied,
      netSales,
      currentPage: Number(page),
      totalPages,
      startDate,
      endDate,
      reportType,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).send("Internal Server Error");
  }
};




/*const downloadPDF = (orders, res) => {
  const doc = new pdf();

  // Create the PDF file in memory
  const filePath = path.join(__dirname, "../../public/reports/sales-report.pdf");
  const writeStream = fs.createWriteStream(filePath);

  doc.pipe(writeStream);

  // Add content to the PDF
  doc.fontSize(20).text("Sales Report", { align: "center" }).moveDown(2);

  orders.forEach((order, index) => {
    doc
      .fontSize(12)
      .text(`Order ${index + 1}:`)
      .text(`Order ID: ${order.orderId}`)
      .text(`Date: ${moment(order.createdOn).format("YYYY-MM-DD")}`)
      .text(`Total Price: ₹${order.totalPrice}`)
      .text(`Discount: ₹${order.discount || 0}`)
      .text(`Final Amount: ₹${order.finalAmount}`)
      .moveDown();
  });

  doc.end();

  // Return the file to the client once it's written
  writeStream.on("finish", () => {
    res.download(filePath, "sales-report.pdf", (err) => {
      if (err) {
        console.error("Error in downloading file:", err);
        res.status(500).send("Error in downloading file");
      }
    });
  });
};*/






/*const PDFDocument = require("pdfkit");

const downloadSalesReportPDF = async (req, res) => {
  // Use similar logic as the getSalesReport function to fetch orders
  const { startDate, endDate, reportType } = req.query;

  // Generate PDF using PDFKit
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="sales-report.pdf"');

  doc.pipe(res);
  doc.fontSize(16).text("Sales Report", { align: "center" });

  // Loop through orders and add to PDF
  orders.forEach((order) => {
    doc.text(`Order ID: ${order.orderId}`);
    order.orderItems.forEach((item) => {
      doc.text(`Product: ${item.product.productName} - Quantity: ${item.quantity}`);
    });
    doc.text(`Total Price: Rs ${order.totalPrice}`);
    doc.text(`Discount: Rs ${order.discount}`);
    doc.text(`Final Amount: Rs ${order.finalAmount}`);
    doc.moveDown();
  });

  doc.end();
};*/


const PDFDocument = require('pdfkit');

const downloadSalesReportPDF = async (req, res) => {
  try {
    let { startDate, endDate, reportType } = req.query;

    // Fetch data (similar to your sales report logic)
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

    const orders = await Order.find({
      createdOn: { $gte: start, $lte: end },
    }).populate("orderItems.product");

    // Create a new PDF document
    const doc = new PDFDocument();
    const fileName = "Sales_Report.pdf";

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/pdf");

    // Add title
    doc.fontSize(16).text("Sales Report", { align: "center" });

    // Add table headers
    doc.moveDown().fontSize(12);
    doc.text("Order ID", { continued: true }).text("Date", { continued: true, align: "center" })
       .text("Product Name", { continued: true, align: "center" })
       .text("Quantity", { continued: true, align: "center" })
       .text("Total Price", { continued: true, align: "center" })
       .text("Discount", { continued: true, align: "center" })
       .text("Final Amount", { align: "center" });

    // Add table rows
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        doc.text(order._id, { continued: true })
          .text(order.createdOn.toISOString().split('T')[0], { continued: true, align: "center" })
          .text(item.product.name, { continued: true, align: "center" })
          .text(item.quantity, { continued: true, align: "center" })
          .text(order.totalPrice, { continued: true, align: "center" })
          .text(order.discount || 0, { continued: true, align: "center" })
          .text(order.finalAmount, { align: "center" });
      });
    });

    // Finalize the document
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("Error generating PDF file:", error);
    res.status(500).send("Internal Server Error");
  }
};












module.exports = {
  getSalesReport,
  downloadSalesReportPDF,
 //downloadPDF,
 
};
