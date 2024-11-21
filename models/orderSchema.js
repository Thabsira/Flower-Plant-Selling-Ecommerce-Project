const mongoose = require("mongoose");
const{Schema} = mongoose;
const{v4:uuidv4} = require('uuid');

const orderSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    orderId:{
        type:String,
        default:()=>uuidv4(),
        unique:true
    },
    orderItems:[{
        product:{
            type:Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        quantity:{
            type:Number,
            required:true,
        },
        price:{
            type:Number,
            default:0,
        }
    }],
    totalPrice:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0
    },

    finalAmount:{
        type:Number,
        required:true
    },
   /* address:{
     type:Schema.Types.ObjectId,
     
    ref:"User",
     required:true,
     street: String,
     city: String,
      state: String,
      pincode: Number,
    },*/

   address: { type: Schema.Types.ObjectId, ref: 'Address', required: true },


    invoiceDate:{
        type:Date
    },
    status:{
        type:String,
        required:true,
        enum:['Pending','Processing','Shipped','Delivered','Cancelled','Return Request',"Returned"]
    },
    createdOn:{
        type:Date,
        default:Date.now,
        required:true
    },
    couponApplied:{
        type:Boolean,
        default:false
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay"],
        required: true,
        default: "COD"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    }
});


const Order = mongoose.model("Order", orderSchema);
module.exports= Order;





/*const mongoose = require("mongoose");
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid');

const orderSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    orderId: {
        type: String,
        default: () => uuidv4(),
        unique: true
    },
    orderItems: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            default: 0
        }
    }],
    totalPrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    address: { 
        type: Schema.Types.ObjectId, 
        ref: 'Address', 
        required: true 
    },
    invoiceDate: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Request', "Returned"]
    },
    createdOn: {
        type: Date,
        default: Date.now,
        required: true
    },
    couponApplied: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay"],
        required: true,
        default: "COD"
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;*/
