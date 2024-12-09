const mongoose = require("mongoose")
const {Schema}= mongoose;

const walletSchema = new Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true,
    },
    balance:{
        type:Number,
        required:true,
        default:0
    },
    currency:{
        type:String,
        default:'INR'
    },
    transactions:[{
        date:{
            type:Date,
            default:Date.now
        },
        amount:{
            type:Number,
            required:true
        },
        type:{
            type:String,
            enum:['credit','debit'],
            required:true
        },
        description:{
            type:String
        },
        razorpay_payment_id:{
            type:String,
            default:null
        }
    }],
    isActive:{
        type:Boolean,
        default:true
    },
},{timestamps:true})

const Wallet = mongoose.model('Wallet',walletSchema)

module.exports=Wallet;