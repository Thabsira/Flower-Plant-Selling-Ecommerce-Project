const User = require("../../models/userSchema");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const pageerror = async(req,res)=>{
    res.render("admin-error")
}


const loadLogin = (req, res) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard');
    }
    res.render("admin-login", { message: null });
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await User.findOne({ email, isAdmin: true });

        if (!admin) {
            return res.render('admin-login', { message: "Admin not found" });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.render('admin-login', { message: "Incorrect password" });
        }

        req.session.admin = {
            _id: admin._id,
            email: admin.email,
        };

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.log("Login error:", error);
        res.redirect("/pageerror");
    }
};

const loadDashboard = async (req, res) => {
    if (!req.session.admin) {
        return res.redirect("/admin/login");
    }
    try {
        res.render("dashboard");
    } catch (error) {
        res.redirect("/pageerror");
    }
};


const logout = async(req,res)=>{
    try{
        req.session.destroy(err=>{
           if(err){
            console.log("Error in destroying session");
            return res.redirect("/pageerror")
           } 
           res.redirect("/admin/login");
        })
    }catch(error){
        console.log("unexpected error during logout",error);
        res.redirect('/pageerror');
    }
}


module.exports={
    loadLogin,
    login,
    loadDashboard,
    pageerror,
    logout
}
