const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/userSchema");

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");





const getProductAddPage = async (req,res)=>{
    try {
        const category = await Category.find({isListed:true});
        res.render("product-add",{
           cat:category,

        });

    } catch (error) {
        res.redirect("/pageerror")
    }
}


const addProducts = async (req,res)=>{
    try {
        const product = req.body;
        const productExists = await Product.findOne({
            productName:product.productName,

        });

        if(!productExists){
            const images = [];

           
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    const originalImagePath = req.files[i].path;

                    // Create a new unique filename for the resized image
                    const resizedImagePath = path.join(
                        __dirname, 
                        "../../public/uploads/product-images", 
                        `resized-${Date.now()}-${req.files[i].filename}`
                    );

                    // Resize the image and save it to the new path
                    await sharp(originalImagePath)
                        .resize({ width: 440, height: 440 })
                        .toFile(resizedImagePath);

                    // Add the resized image path to the images array
                    images.push(resizedImagePath); // Save resized image path
                }
            }





            const categoryId = await Category.findOne({name:product.category});

            if(!categoryId){
                return res.status(400).send("Invalid category Name")
            }

            const newProduct = new Product({
                productName:product.productName,
                description:product.description,
                category:categoryId._id,
                regularPrice:product.regularPrice,
                salePrice:product.salePrice,
                createdOn:new Date(),
                quantity:product.quantity,
                size:product.size,
                color:product.color,
                productImage:images,
                status:"Available",

            });

            await newProduct.save();
            return res.redirect("/admin/addProducts");

        }else{
           return res.status(400).json("Product Already exists. please try with another name"); 
        }
    } catch (error) {
        console.error("Error saving product",error);
        return res.redirect("/admin/pageerror")        
    }
}


const getAllProducts = async (req,res)=>{
    try {
        const search = req.query.search || "";
        const page =parseInt(req.query.page, 10) || 1;
        const limit = 4;

        const productData = await Product.find({
            $or:[
                {productName:{$regex:new RegExp(".*" + search + ".*","i")}},


            ],})
            .limit(limit)
            .skip((page-1)*limit)
            .populate('category')
            .exec();

            const count = await Product.find({
                $or:[
                    {productName: {$regex:new RegExp(".*"+search+".*","i")}},
                ],
            }).countDocuments();

            const category = await Category.find({isListed:true});

            if(category.length> 0){
                res.render("products",{
                    data:productData,
                    currentPage:page,
                    totalPages:Math.ceil(count/limit),
                    cat:category,

                });
            }else{
                res.render("admin-error.ejs");
            }

    } catch (error) {
       console.error("error",error.message);
       res.redirect("/admin/pageerror"); 
    }
};




module.exports ={
    getProductAddPage,
    addProducts,
    getAllProducts
};