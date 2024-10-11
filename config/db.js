const mongoose= require('mongoose')
require('dotenv').config()


const connectBD = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB connected");
        
    }
    catch(error){
        console.log("DB connection error", error.message);
        process.exit(1)
        
    }
}

module.exports=connectBD;