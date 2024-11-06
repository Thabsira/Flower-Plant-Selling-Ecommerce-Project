const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");

const getAllOrders = async (req, res) => {
  try {
      const orders = await Order.find().populate('orderItems.product'); // Populate product details if necessary
      res.render('orders', { orders }); // Adjust the view path
  } catch (error) {
      res.status(500).send('Error retrieving orders');
  }
};


const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body; // Ensure validation for status

  // Validate status (optional)
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
      // Find and update the order status
      const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true } // Return the updated document
      );

      if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Error updating order status' });
  }
};


const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
      // Find the order and update the status to 'Cancelled'
      const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status: 'Cancelled' },
          { new: true } // Return the updated document
      );

      if (!updatedOrder) {
          return res.status(404).json({ message: 'Order not found' });
      }

      res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
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
