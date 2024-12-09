const mongoose = require("mongoose");
const{Schema} = mongoose;

const couponSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    createdOn:{
        type:Date,
        default:Date.now,
        required:true
    },
   
    couponCode:{
        type:String,
        required:true,
    },
    expireOn:{
        type:Date,
        required:true
    },
    offerPrice:{
        type:Number,
        required:true
    },
    minimumPrice:{
        type:Number,
        required:true
    },
    isList:{
        type:Boolean,
        default:true
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },

    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [] // Initialize as an empty array
    }],
   /* usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],*/

    userId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]


})

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports=Coupon;