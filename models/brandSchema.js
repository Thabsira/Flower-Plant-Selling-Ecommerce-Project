const mongoose=require("mongoose");
const{Schema}= mongoose;

const brandSchema= new Schema({
    brandName:{
        type:String,
        required:false
    },
    brandImage:{
        typr:[String],
        required:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Brand = mongoose.model("Brand", brandSchema);
module.exports= Brand;