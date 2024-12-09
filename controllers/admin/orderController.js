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
      .populate({
        path: 'address',
        populate: {
          path: 'userId',
          select: 'name email',
        },
      })
      .populate('orderItems.product') 
      .populate('userId', 'name email') 
      .sort({ createdOn: -1 }) 
      .skip(skip) 
      .limit(limit)
      .exec();

    const formattedOrders = orders.map((order) => {
      const address = order.address; 
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
        formattedAddress,
      };
    });

    console.log(JSON.stringify(formattedOrders, null, 2));
    const totalPages = Math.ceil(totalOrders / limit);

    res.render('orders', {
      orders: formattedOrders, 
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
