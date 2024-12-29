
const User=require("../../models/userSchema");
const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema");
//const Wallet = require("../../models/walletSchema");
//const Transaction = require("../../models/transactionSchema");
const Wallet = require("../../models/walletSchema")

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


const { v4: uuidv4 } = require('uuid'); 


const generateReferralCode = () => {
    return uuidv4();  
}


/*const signup=async(req,res)=>{
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

       // const wallet = user.wallet || { balance: 0, transactions: [] };
        //const initialWalletBalance = 100; // Default initial balance
       // const wallet = { balance: initialWalletBalance, transactions: [] };


        req.session.userOtp=otp;
        req.session.userData={name,phone,email,password,wallet};

        res.render("verify-otp");
        console.log("OTP sent",otp);

    }catch(error){
        console.error("signup error",error);
        res.redirect("/pageNotFound")

    }
}*/



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
        productData = productData.slice(0,12);


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




const verifyOtp = async (req, res) => {
    try {
        const { otp, referralCode} = req.body; 

        //console.log(wallet);

        console.log(otp);
        console.log("Stored OTP in session:", req.session.userOtp);

        if (String(otp.trim()) === String(req.session.userOtp.trim())) {
            const user = req.session.userData;

            if (!user) {
                console.error("No user data in session.");
                return res.status(400).json({ success: false, message: "User data not found in session." });
            }

            const passwordHash = await securePassword(user.password);

            const userData = {
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash,
               // wallet: user.wallet,
                referalCode: generateReferralCode(),
            };

            if (referralCode) {
                const referredUser = await User.findOne({ referalCode });

                if (referredUser) {
                    userData.redeemed = true;
                    referredUser.redeemedusers.push(userData._id);
                    referredUser.wallet += 10; 
                    await referredUser.save();
                }
            }

            if (user.googleId) {
                userData.googleId = user.googleId;
            }

            const saveUserData = new User(userData);
            await saveUserData.save();

            req.session.user = saveUserData;
            res.json({ success: true, redirectUrl: "/" });
        } else {
            console.error("OTP does not match.");
            res.status(400).json({ success: false, message: "Invalid OTP, Please try again" });
        }
    } catch (error) {
        console.error("Error Verifying OTP", error.message);
        res.status(500).json({ success: false, message: "An error occurred" });
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

//login 
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




const productDetails = async (req, res) => {
    try {
        const user = req.session.user;
        const productId = req.query.id;

        const products = await Product.findById(productId).populate('category');
        if (!products) {
            return res.status(404).send("Product Not Found");
        }
        const productOffer = products.productOffer || 0;
        const categoryOffer = products.category.categoryOffer || 0;
        const highestOffer = Math.max(productOffer, categoryOffer);

        let salePrice = products.regularPrice;
        if (highestOffer > 0) {
            salePrice = products.regularPrice - (products.regularPrice * (highestOffer / 100));
        }

        if (user) {
            const userData = await User.findOne({ _id: user._id });
            res.render('productDetails.ejs', {
                products,
                userData,
                highestOffer,
                salePrice,
            });
        }
    } catch (error) {
        console.error("Some error", error);
        res.status(500).send('Server error');
    }
};




/*const loadWalletPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        console.log("userId", userId);

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.render('wallet', {
                balance: 0,
                transactions: [],
                showAll: false
            });
        }

        console.log('wallet', wallet);

        const sortedTransactions = wallet.transactions.sort((a, b) => b.date - a.date);
        console.log('sortedtransactions', sortedTransactions);

        let transactions = sortedTransactions.map(item => ({
            ...item.toObject(),
            date: item.date.toISOString().split("T")[0]
        }));


        const showAll = req.query.view === "all";
        if (!showAll) {
            transactions = transactions.slice(0, 4); 
        }

        console.log('transactions', transactions);
        res.render('wallet', {
            balance: wallet.balance.toFixed(2),
            transactions: transactions,
            showAll: showAll
        });
    } catch (error) {
        console.error('Error loading wallet page', error);
        res.status(500).send('Error loading wallet page');
    }
};*/


const loadWalletPage = async (req, res) => {
    try {
        const userId = req.session.user._id;
        console.log("userId", userId);

        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            return res.render('wallet', {
                balance: 0,
                transactions: [],
                currentPage: 1,
                totalPages: 1
            });
        }

        console.log('wallet', wallet);

        // Pagination logic
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = 4; // Number of transactions per page
        const totalTransactions = wallet.transactions.length;
        const totalPages = Math.ceil(totalTransactions / limit);

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedTransactions = wallet.transactions
            .sort((a, b) => b.date - a.date) // Sort by date (newest first)
            .slice(startIndex, endIndex) // Paginate transactions
            .map(item => ({
                ...item.toObject(),
                date: item.date.toISOString().split("T")[0]
            }));

        res.render('wallet', {
            balance: wallet.balance.toFixed(2),
            transactions: paginatedTransactions,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error('Error loading wallet page', error);
        res.status(500).send('Error loading wallet page');
    }
};














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
    generateReferralCode,
    loadWalletPage,
   // getWalletPage,
    
   

}