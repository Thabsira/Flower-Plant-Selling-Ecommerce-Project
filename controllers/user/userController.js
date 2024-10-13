
const User=require("../../models/userSchema")
const env=require("dotenv").config();
const nodemailer=require('nodemailer');
const bcrypt=require('bcrypt')
const loadSignup= async (req,res)=>{
    try{
    return res.render('signup');
}
catch(error){
    console.log('Home page not loading',error);
    res.status(500).send('server Error');
}

}

function generateOtp(){
    return Math.floor(100000 + Math.random()*900000).toString();
}

async function sendVerificationEmail(email,otp){
    try{
        const transporter=nodemailer.createTransport({
            service:'gmail',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const info=await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"verify your account",
            text:`Your OTP is ${otp}`,
            html:`<b> Your OTP:${otp}</b> `,
        })

        return info.accepted.length >0

    }catch(error){
        console.error("Error sending email", error);
        return false;

    }
}


const signup=async(req,res)=>{
    try{
        const{name,phone,email,password,cPassword}=req.body;
        console.log("Form data:", email, password, cPassword);
        if(password!==cPassword){
            return res.render("signup",{message:"Password do not match"});
        }
        const findUser=await User.findOne({email});
        if(findUser){
            return res.render("signup",{message:"User with this email already exists"});
        }

        const otp=generateOtp();

        const emailSent= await sendVerificationEmail(email,otp);

        if(!emailSent){
            return res.json("email error")
        }

        req.session.userOtp=otp;
        req.session.userData={name,phone,email,password};

        res.render("verify-otp");
        console.log("OTP sent",otp);

    }catch(error){
        console.error("signup error",error);
        res.redirect("/pageNotFound")

    }
}



const pageNotFound= async (req,res)=>{
    try{
        res.render("page_404")
    }catch(error){
        res.redirect('/pageNotFound')
    }
}


const loadHomepage = async (req,res)=>{
    try{
        return res.render("home");
    } catch(error){
        console.log("home page not found");
        res.ststus(500).send("server error");
        

    }
}


const securePassword=async(password)=>{
    try{
        const passwordHash= await bcrypt.hash(password,10) 
        return passwordHash;

    }catch(error){

    }
}


const verifyOtp=async (req,res)=>{
    try{

        const{otp}=req.body;

        console.log(otp);
        console.log("Stored OTP in session:", req.session.userOtp);

        if(String(otp.trim())===String(req.session.userOtp)){
            const user=req.session.userData
            const passwordHash= await securePassword(user.password);
            const saveUserData = new User({
                name:user.name,
                email:user.email,
                phone:user.phone,
                password:passwordHash,
            })

            await saveUserData.save();
            req.session.user=saveUserData._id;
            res.json({success:true, redirectUrl:"/"})
        }
        else{
            res.status(400).json({success:false,message:"Invalid OTP, Please try again"})
        }

    }catch(error){
        console.error("Error Verifying OTP",error);
        res.status(500).json({success:false,message:"An error occured"})

    }
}


const resendOtp=async(req,res)=>{
    try{
        const {email}=req.session.userData;
        if(!email){
            return res.status(400).json({success:false,message:"Email not found in session"})
        }

        const otp=generateOtp();
        req.session.userOtp=otp;

        const emailSent= await sendVerificationEmail(email,otp);
        if(emailSent){
            console.log("Resend OTP",otp);
            res.status(200).json({success:true,message:"OTP Resend Successfully "});

        }else{
            res.status(500).json({success:false,message:"Failed to resend otp. Please try again"})
        }
    }catch(error){
        console.error("Error resending OTP",error);
        res.status(500).json({success:false,message:"Internal Server Error. Please try again"})

    }
}

const loadLogin = async (req,res)=>{
    try{

       if(!req.session.user){
        return res.render("login")
       } else{
        res.redirect('/')
       }

    }catch(error){
        res.redirect("/pageNotFound");
    }
}


const login = async(req,res)=>{
    try{

    const {email,password}=req.body;
    const findUser = await User.findOne({isAdmin:0,email:email});

    if(!findUser){
        return res.render("login",{message:"User Not Found"})
    }
    if(findUser.isBlocked){
        res.render("login",{message:"User is blocked by admin"})
    }


    if (!password || !findUser.password) {
        return res.render("login", { message: "Password is required." });
    }

    const passwordMatch = await bcrypt.compare(password,findUser.password);

    if(!passwordMatch){
        return res.render("login",{message:"Incorrect Password"})
    }

    req.session.user = findUser._id;
    res.redirect("/")

    }catch(error){
        console.error("login error", error);
        res.render("login",{message:"Login Failed. Please try again later"});

    }
}



module.exports= {
    loadHomepage,
    pageNotFound,
    loadSignup,
    signup,
    verifyOtp,
    resendOtp,
    loadLogin,
    login,

}