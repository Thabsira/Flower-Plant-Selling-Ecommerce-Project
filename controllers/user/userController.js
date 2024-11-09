
const User=require("../../models/userSchema");
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");

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
        const user= req.session.user;
        const categories = await Category.find({isListed:true});
        let productData = await Product.find(
            {isBlocked:false,
                category:{$in:categories.map(category=>category._id)},quantity:{$gt:0}
            }
        )

        productData.sort((a,b)=> new Date(b.createdOn)-new Date(a.createdOn));
        productData = productData.slice(0,15);


        if(user){
           const userData = await User.findOne({_id:user._id});
           return res.render("home",{user:userData,products:productData}); 
        }else{
            return res.render("home",{products:productData});
        }
    
    } catch(error){
        console.log("home page not found");
        res.status(500).send("server error");
        

    }
}


/*const loadHomepage = async (req, res) => {
    try {
        const user = req.session.user;  // Get user info from session if logged in
        const categories = await Category.find({ isListed: true });  // Fetch all active categories
        let productData = await Product.find({
            isBlocked: false,  // Only show unblocked products
            category: { $in: categories.map(category => category._id) }, // Filter products by listed categories
            quantity: { $gt: 0 }  // Only show products in stock
        });

        // Sort products by creation date (most recent first)
        productData.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
        productData = productData.slice(0, 15);  // Limit the number of displayed products

        if (user) {
            // If user is logged in, fetch user data to pass username to the view
            const userData = await User.findOne({ _id: user._id });
            return res.render("home", { 
                user: userData,         // Pass user data for a logged-in session
                username: userData.username,  // Specifically pass the username for display
                products: productData   // Pass product data to the view
            });
        } else {
            // If no user is logged in, pass only product data to the view
            return res.render("home", { 
                products: productData,
                username: null   // Pass null for username to indicate user is not logged in
            });
        }
    } catch (error) {
        console.log("Home page not found");
        res.status(500).send("Server error");
    }
};*/





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

        if(String(otp.trim())===String(req.session.userOtp.trim())){
            const user=req.session.userData

           if (!user) {
                console.error("No user data in session.");
                return res.status(400).json({ success: false, message: "User data not found in session." });
            }



            const passwordHash= await securePassword(user.password);
            const userData = {
                name:user.name,
                email:user.email,
                phone:user.phone,
                password:passwordHash,
              //  ...(user.googleId && { googleId: user.googleId })
            };




            if (user.googleId) {
                userData.googleId = user.googleId; // Only add googleId if it exists
            }



          /*  const existingUser = await User.findOne({
                $or: [
                    { email: user.email },
                    { googleId: userData.googleId } // This will be null if user is signing up without Google
                ]
            });

            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists with this email or Google ID" });
            }*/





            const saveUserData = new User(userData); 








            await saveUserData.save();
            req.session.user=saveUserData;
            res.json({success:true, redirectUrl:"/"})
        }
        else{
            console.error("OTP does not match.");
            res.status(400).json({success:false,message:"Invalid OTP, Please try again"})
        }

    }catch(error){
        console.error("Error Verifying OTP",error.message);
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
        console.error("Error resending OTP",error.message);
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

    req.session.user = findUser;
  //  req.session.userId = findUser._id; // Setting userId in session

       // req.session.userId = findUser._id;
       // req.session.username = findUser.username; 
    res.redirect("/")

    }catch(error){
        console.error("login error", error);
        res.render("login",{message:"Login Failed. Please try again later"});

    }
}


const logout = async(req,res)=>{
    try{
        req.session.destroy((err)=>{
            if(err){
            console.log("Session destruction error",err.message);
            return res.redirect("/pageNotFound");
            }
            return res.redirect('/login')
        })
    }catch(error){
        console.log("Logout error",error);
        res.redirect("/pageNotFound")

    }
}


const productDetails = async(req,res)=>{
    try {
        const user= req.session.user;
        const productId = req.query.id;
        const products = await Product.findById(productId).populate('category');
        if(!products){
            
            return  res.status(404).send("Product Not Found")
        }
        if(user){
            const userData = await User.findOne({_id:user._id});
        console.log(products)
        res.render('productDetails.ejs',{products,userData})
        }
    } catch (error) {
        console.error("Some error",error)
       res.status(500).send('Server error',error) 
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
    logout,
    productDetails,
   

}