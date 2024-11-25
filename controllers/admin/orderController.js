const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");



/*const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1; 
  const limit = parseInt(req.query.limit) || 10; 
  const skip = (page - 1) * limit; 

  try {
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .populate('orderItems.product')
      .populate({
        path: 'address',
        model: 'Address',
      })
      .sort({ createdOn: -1 })
      .skip(skip) 
      .limit(limit) 
      .exec();

    const totalPages = Math.ceil(totalOrders / limit);
    res.render('orders', {
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
      limit,
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).send("Error retrieving orders");
  }
};*/



/*const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Count total orders for pagination
    const totalOrders = await Order.countDocuments();

    // Fetch orders with populated fields
    const orders = await Order.find()
      .populate('orderItems.product') // Populates the product details
      .populate('address') // Populates the address details
      .populate({
        path: 'userId', // Populates user details
        select: 'name email', // Only fetches necessary fields
      })
      .sort({ createdOn: -1 }) // Sort orders by creation date
      .skip(skip) // Skip for pagination
      .limit(limit) // Limit the number of orders
      .exec();

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalOrders / limit);

    // Render the orders view
    res.render('orders', {
      orders, // Pass orders with populated data
      currentPage: page,
      totalPages,
      totalOrders,
      limit,
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).send("Error retrieving orders");
  }
};*/



/*const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Count total orders for pagination
    const totalOrders = await Order.countDocuments();

    // Fetch orders with populated fields
    const orders = await Order.find()
      .populate('orderItems.product') // Populate product details
      .populate({
        path: 'address', // Populate address details
        populate: {
          path: 'userId', // Populate user details within the address
          select: 'name email', // Select only necessary user fields
        },
        select: 'address', // Select only the address array
      })
      .populate({
        path: 'userId', // Populate user who placed the order
        select: 'name email', // Select only necessary user fields
      })
      .sort({ createdOn: -1 }) // Sort orders by creation date
      .skip(skip) // Skip for pagination
      .limit(limit) // Limit the number of orders
      .exec();

    // Format addresses for rendering
    const formattedOrders = orders.map(order => {
      const addressData = order.address && order.address.address ? order.address.address[0] : null; // Pick the first address (customize if needed)
      return {
        ...order._doc,
        formattedAddress: addressData, // Include formatted address for the view
      };
    });

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalOrders / limit);

    // Render the orders view
    res.render('orders', {
      orders: formattedOrders, // Pass orders with formatted address data
      currentPage: page,
      totalPages,
      totalOrders,
      limit,
    });
  } catch (error) {
    console.error("Error retrieving orders:", error);
    res.status(500).send("Error retrieving orders");
  }
};*/




const getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    // Count total orders for pagination
    const totalOrders = await Order.countDocuments();

    // Fetch orders with populated fields, including specific address
    const orders = await Order.find()
      .populate({
        path: 'address',
        populate: {
          path: 'userId', // Populate the user related to the address if needed
          select: 'name email',
        },
      })
      .populate('orderItems.product') // Populate the product details
      .populate('userId', 'name email') // Populate user details with specific fields
      .sort({ createdOn: -1 }) // Sort orders by creation date
      .skip(skip) // Skip for pagination
      .limit(limit) // Limit the number of orders
      .exec();

    // Format orders to include detailed address data
    const formattedOrders = orders.map((order) => {
      const address = order.address; // The specific address used for this order
      const formattedAddress = address
        ? {
            addressType: address.addressType,
            name: address.name,
            city: address.city,
            landMark: address.landMark,
            state: address.state,
            pincode: address.pincode,
            phone: address.phone,
            altPhone: address.altPhone,
          }
        : null;

      return {
        ...order._doc,
        formattedAddress, // Include the specific address used for the order
      };
    });

    console.log(JSON.stringify(formattedOrders, null, 2));

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalOrders / limit);

    // Render the orders view
    res.render('orders', {
      orders: formattedOrders, // Pass orders with formatted address data
      currentPage: page,
      totalPages,
      totalOrders,
      limit,
    });
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).send('Error retrieving orders');
  }
};








const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.status === 'Delivered') {
      return res.status(400).json({ message: 'Order status cannot be changed once it is set to Delivered' });
    }
    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};




const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
      const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status: 'Cancelled' },
          { new: true }
      );
      if (!updatedOrder) {
          return res.status(404).json({ message:'Order not found'});
      }
      res.status(200).json({ message:'Order cancelled successfully', order: updatedOrder });
  } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Error cancelling order' });
  }
};




module.exports = {
  getAllOrders,
  updateOrderStatus,
  cancelOrder,

}
