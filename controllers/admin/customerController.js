const User = require("../../models/userSchema");


const customerInfo = async(req,res)=>{
    try{

        let search = "";
        if(req.query.search){
            search=req.query.search;
        }
        let page=parseInt(req.query.page) || 1;
    
    
        const limit=3;
        const userData = await User.find({
            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*", $options: "i" }},
                {email:{$regex:".*"+search+".*", $options: "i" }},

            ],
        })
        .limit(limit)
        .skip((page-1) * limit)
        .exec();

        const count = await User.find({
            isAdmin:false,
            $or:[
                {name:{$regex:".*"+search+".*", $options: "i" }},
                {email:{$regex:".*"+search+".*", $options:"i" }},

            ],

        }).countDocuments();

        res.render('customers',{
            users:userData,
            totalPages:Math.ceil(count/limit),
            currentPage:page,
            search:search

        });

    }catch(error){
        console.error("Error fetching customer data",error);
        res.status(500).send("Error occured");

    }
}


const customerBlocked = async (req,res)=>{
    try {

        let id = req.query.id;
        await User.updateOne({ _id:id},{$set:{isBlocked:true}});
        res.redirect("/admin/users");
        
    } catch (error) {
        res.redirect("/pageerror");
        
    }
};


const customerunBlocked = async (req,res)=>{
    try {
        
        let id = req.query.id;
        await User.updateOne({_id:id},{$set:{isBlocked:false}});
        res.redirect("/admin/users")

    } catch (error) {
        res.redirect("/pageerror");
        
    }
};



module.exports={
    customerInfo,
    customerBlocked,
    customerunBlocked,
}