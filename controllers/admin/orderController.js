const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");



const getAllOrders = async (req, res) => {
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
