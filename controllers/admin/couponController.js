
const Coupon = require("../../models/couponSchema");
const flash = require("connect-flash");



const getCouponsList = async (req, res) => {
    try {
    
      const coupons = await Coupon.find().sort({ createdOn: -1 });
  
      res.render('couponsList', { coupons });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching coupons.' });
    }
  };



  const showCreateCouponForm = (req, res) => {
    res.render("couponCreate"); 
};



/*const createCoupon = async (req, res) => {
  const { name,couponCode, expireOn, offerPrice, minimumPrice } = req.body;
  if (!name || !expireOn || !offerPrice || !minimumPrice) {
      req.flash("error", "All fields are required.");
      return res.redirect("/admin/coupons/create");
  }
  const currentDate = new Date();
  if (new Date(expireOn) <= currentDate) {
      req.flash("error", "Expiry date must be in the future.");
      return res.redirect("/admin/coupons/create");
  }
  if (offerPrice <= 0) {
      req.flash("error", "Offer price must be a positive number.");
      return res.redirect("/admin/coupons/create");
  }
  if (minimumPrice <= 0) {
      req.flash("error", "Minimum purchase price must be a positive number.");
      return res.redirect("/admin/coupons/create");
  }

  try {
      const newCoupon = new Coupon({
          name,
          couponCode,
          expireOn: new Date(expireOn), 
          offerPrice,
          minimumPrice,
      });

      await newCoupon.save();

      req.flash("success", "Coupon created successfully!");
      res.redirect("/admin/list"); 
  } catch (err) {
      console.log(err);
      req.flash("error", "Failed to create coupon.");
      res.redirect("/admin/coupons/create");
  }
};*/


const createCoupon = async (req, res) => {
  const { name, couponCode, expireOn, offerPrice, minimumPrice } = req.body;

  // Validate required fields
  if (!name || !couponCode || !expireOn || !offerPrice || !minimumPrice) {
      req.flash("error", "All fields are required.");
      return res.redirect("/admin/coupons/create");
  }

  // Validate expiry date
  const currentDate = new Date();
  if (new Date(expireOn) <= currentDate) {
      req.flash("error", "Expiry date must be in the future.");
      return res.redirect("/admin/coupons/create");
  }

  // Validate offer price and minimum price
  if (offerPrice <= 0) {
      req.flash("error", "Offer price must be a positive number.");
      return res.redirect("/admin/coupons/create");
  }

  if (minimumPrice <= 0) {
      req.flash("error", "Minimum purchase price must be a positive number.");
      return res.redirect("/admin/coupons/create");
  }

  try {
      // Save the coupon
      const newCoupon = new Coupon({
          name,
          couponCode,
          expireOn: new Date(expireOn),
          offerPrice,
          minimumPrice,
      });

      await newCoupon.save();

      req.flash("success", "Coupon created successfully!");
      res.redirect("/admin/list"); // Redirect to the list of coupons or the desired page
  } catch (err) {
      console.error("Error creating coupon:", err);
      req.flash("error", "Failed to create coupon.");
      res.redirect("/admin/coupons/create");
  }
};




const deleteCoupon = async (req, res) => {
  try {
      const couponId = req.params.id;
      await Coupon.findByIdAndDelete(couponId);
      req.flash('success', 'Coupon deleted successfully!'); 
      res.redirect('/admin/list'); 
  } catch (err) {
      console.error('Error deleting coupon:', err);
      req.flash('error', 'Failed to delete coupon!');
      res.redirect('/admin/list');
  }
};


const editCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the coupon by ID
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      req.flash("error", "Coupon not found.");
      return res.redirect("/admin/list");
    }

    res.render("editCoupon", { coupon });
  } catch (err) {
    console.error("Error fetching coupon for edit:", err);
    req.flash("error", "Failed to fetch coupon details.");
    res.redirect("/admin/list");
  }
};

const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const { name, couponCode, expireOn, offerPrice, minimumPrice } = req.body;

  // Validate input fields
  if (!name || !couponCode || !expireOn || !offerPrice || !minimumPrice) {
    req.flash("error", "All fields are required.");
    return res.redirect(`/admin/edit/${id}`);
  }

  // Validate expiry date
  const currentDate = new Date();
  if (new Date(expireOn) <= currentDate) {
    req.flash("error", "Expiry date must be in the future.");
    return res.redirect(`/admin/edit/${id}`);
  }

  // Validate offer price and minimum price
  if (offerPrice <= 0 || minimumPrice <= 0) {
    req.flash(
      "error",
      "Offer price and minimum purchase price must be positive numbers."
    );
    return res.redirect(`/admin/edit/${id}`);
  }

  try {
    // Update the coupon
    await Coupon.findByIdAndUpdate(
      id,
      { name, couponCode, expireOn: new Date(expireOn), offerPrice, minimumPrice },
      { new: true }
    );

    req.flash("success", "Coupon updated successfully!");
    res.redirect("/admin/list"); // Redirect to the list page
  } catch (err) {
    console.error("Error updating coupon:", err);
    req.flash("error", "Failed to update coupon.");
    res.redirect(`/admin/coupons/edit/${id}`);
  }
};




  module.exports = {
    getCouponsList,
    showCreateCouponForm,
    createCoupon,
    deleteCoupon,
    editCoupon,
    updateCoupon,
  }