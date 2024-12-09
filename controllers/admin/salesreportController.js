const Order = require("../../models/orderSchema");
const moment = require("moment");




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

  
    const allOrders = await Order.find({
      createdOn: { $gte: start, $lte: end },
    }).populate("orderItems.product");

    const totalSalesCount = allOrders.length;

    let overallOrderAmount = 0;
    let couponDeduction = 0;
    let totalOffersApplied = 0;

    allOrders.forEach((order) => {
      overallOrderAmount += order.totalPrice;
      couponDeduction += order.discount || 0;
    

      const offerDiscount = order.orderItems.reduce((sum, item) => {
        const regularPrice = item.product.regularPrice;
        const discountedPrice = item.price;
        return sum + (regularPrice - discountedPrice) * item.quantity;
      }, 0);

      totalOffersApplied += offerDiscount;
    });

    const netSales = overallOrderAmount - couponDeduction - totalOffersApplied;

    const orders = await Order.find({
      createdOn: { $gte: start, $lte: end },
    })
      .populate("orderItems.product")
      .skip(skip)
      .limit(limit);

    const totalOrders = allOrders.length;
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






const PDFDocument = require("pdfkit");

const downloadSalesReportPDF = async (req, res) => {
  try {
    let { startDate, endDate, reportType } = req.query;
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


    const doc = new PDFDocument();
    const fileName = `Sales_Report_${Date.now()}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    doc.pipe(res);
    doc.fontSize(20).text("Sales Report", { align: "center" });
    doc.fontSize(12).text(`Date Range: ${startDate || start.toDateString()} - ${endDate || end.toDateString()}`, { align: "center" });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(14).text(`Order ID: ${order.orderId}`);
      order.orderItems.forEach((item) => {
        doc.fontSize(12).text(`- Product: ${item.product.productName}`);
        doc.fontSize(12).text(`  Quantity: ${item.quantity}`);
        doc.fontSize(12).text(`  Sold Price: Rs ${item.price.toFixed(2)}`);
      });
      doc.moveDown();
    });

    doc.addPage().fontSize(20).text("Summary", { align: "center" });
    doc.fontSize(14).text(`Total Sales Count: ${orders.length}`);
    doc.fontSize(14).text(`Overall Order Amount: Rs ${orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}`);
    doc.fontSize(14).text(`Net Sales: Rs ${orders.reduce((sum, order) => sum + order.finalAmount, 0).toFixed(2)}`);
    
    doc.end();
  } catch (error) {
    console.error("Error downloading sales report as PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};


const XLSX = require("xlsx");

const downloadSalesReportAsExcel = async (req, res) => {
  try {
    let { startDate, endDate, reportType } = req.query;

    let start, end;

    if (!reportType || reportType === "weekly") {
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

    const data = orders.map(order => {
      const totalRegularPrice = order.orderItems.reduce((sum, item) => {
        return sum + item.product.regularPrice * item.quantity;
      }, 0);
      const totalOffer = totalRegularPrice - order.totalPrice;

      return {
        OrderID: order.orderId,
        Products: order.orderItems.map(item => item.product.productName).join(", "),
        Quantity: order.orderItems.map(item => item.quantity).join(", "),
        RegularTotalPrice: totalRegularPrice.toFixed(2),
        Discount: totalOffer.toFixed(2),
        CouponDeduction: order.discount || 0,
        SoldPrice: order.finalAmount,
        Date: order.createdOn.toISOString().split("T")[0],
      };
    });


    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Disposition", "attachment; filename=sales_report.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading Excel report:", error);
    res.status(500).send("Internal Server Error");
  }
};





module.exports = {
  getSalesReport,
  downloadSalesReportPDF,
  downloadSalesReportAsExcel,
};
