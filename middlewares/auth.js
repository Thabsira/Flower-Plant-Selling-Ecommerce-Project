const User = require("../models/userSchema");

/*const userAuth = (req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user)
        .then(data=>{
            if(data && !data.isBlocked){
                next();
            }else{
                res.redirect("/login")
            }
        })
        .catch(error=>{
            console.log("Error in user auth middleware",error);
            res.status(500).send("internal sever error")
        })
    }else{
        res.redirect("/login")
    }
}*/



const userAuth = (req, res, next) => {
    //console.log('userAuth middleware triggered for:', req.path);
    if (req.session.user) {
        User.findById(req.session.user)
            .then(data => {
                if (data && !data.isBlocked) {
                    req.user = data; 
                    next();
                } else {
                    res.redirect("/login");
                }
            })
            .catch(error => {
                console.log("Error in user auth middleware", error);
                res.status(500).send("Internal server error");
            });
    } else {
        res.redirect("/login");
    }
};




/*const adminAuth = (req,res,next)=>{
    User.findOne({isAdmin:true})
    .then(data=>{
        if(data){
            next();
        }else{
            res.redirect("/admin/login")
        }
    })
    .catch(error=>{
        console.log("Error in admin auth middleware");
        res.status(500).send("Internal server Error")
    })
} */



    

    const adminAuth = async (req, res, next) => {
        try {
            if (!req.session || !req.session.admin) {
                req.flash("error", "You must be logged in as an admin.");
                return res.redirect("/admin/login");
            }
            const admin = await User.findById(req.session.admin._id);
            if (!admin || !admin.isAdmin) {
                req.flash("error", "Access denied. Admins only.");
                return res.redirect("/admin/login");
            }
            req.admin = admin;
            next();
        } catch (error) {
            console.error("Error in adminAuth middleware:", error);
            res.status(500).send("Internal Server Error");
        }
    };
    
    
    


module.exports={
    userAuth,
    adminAuth
}