const mongoose = require("mongoose");
const{Schema}=mongoose;


const productSchema= new Schema({
    productName:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:"Category",
    },
    regularPrice:{
        type:Number,
        required:true
    },
    salePrice:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        default:0,

    },
    productOffer:{
        type:Number,
        default:0,
    },
    quantity:{
        type:Number,
        //default:true
        default: 0
    },
    color:{
        type:String,
        required:true
    },
    productImage:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["Available","out of stock","Discontinued"],
        required:true,
        //default:0,
        default: "Available"
    },
    rating: {
        type: Number,
        default: 0 
    },
    featured: {
        type: Boolean,
        default: false
    },
    wishlist:[{
        type:Schema.Types.ObjectId,
        ref:"Wishlist"
    }],
    


},{timestamps:true});

productSchema.index({ productName: 'text' });


const Product= mongoose.model("Product",productSchema);

module.exports=Product;