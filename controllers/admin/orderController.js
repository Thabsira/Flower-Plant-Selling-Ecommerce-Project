const Order = require("../../models/orderSchema");
const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");

const getAllOrders = async (req, res) => {
    
  try {
  //   const orders = await Order.find().populate('orderItems.product createdOn address'); 
  /* const orders = await Order.find()
  .populate('orderItems.product createdOn')
  .populate({
    path: 'address',  
    select: 'addressDetails',
  })
  .exec();*/
  const orders = await Order.find()
  .populate('orderItems.product')
  .populate({
    path: 'address',        
   // select: 'address',  
   model: 'Address', 
  })
  .exec();
  console.log(orders)

 /* const orders = await Order.find()
 .populate({
    path: 'address',
    populate: { path: 'userId', select: 'username' }, 
  })
    .populate('address')
  .populate('orderItems.product')
  .exec();

console.log(orders);*/
      
      res.render('orders', { orders }); 
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
      const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status },
          { new: true } 
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
