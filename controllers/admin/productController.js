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
                   /* const resizedImagePath = path.join(
                        __dirname, 
                        "../../public/uploads/product-images", 
                        `resized-${Date.now()}-${req.files[i].filename}`
                    );*/


                    const timestamp = Date.now();
                    const resizedImageName = `resized-${timestamp}-${req.files[i].filename}`;
                    const resizedImagePath = path.join(
                        __dirname, 
                        "../../public/uploads/product-images", 
                        resizedImageName
                    );




                    try{
                    // Resize the image and save it to the new path
                    await sharp(originalImagePath)
                        .resize({ width: 440, height: 440 })
                        .toFile(resizedImagePath);

                    // Add the resized image path to the images array
                    images.push(`/uploads/product-images/${resizedImageName}`);
                    console.log('Resized image path stored in the array:', `/uploads/product-images/${resizedImageName}`); // Save resized image path
                }catch(error)
{
    console.error("error",error);
}            }
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
                console.error("No categories found, rendering error page");
                res.render("admin-error.ejs");
            }

    } catch (error) {
       console.error("error",error.message);
       res.redirect("/pageerror"); 
    }
};


const addProductOffer = async(req,res)=>{
    try {
        const {productId,percentage} = req.body;
        console.log("Received offer for product:", productId, "with percentage:", percentage);

        const findProduct = await Product.findOne({_id:productId});
        const findCategory = await Category.findOne({_id:findProduct.category});
        if(findCategory.categoryOffer>percentage){
            return res.json({status:false,message:"This products category already has a category offe"});

        }

        findProduct.salePrice = Math.floor(findProduct.regularPrice - (findProduct.regularPrice * (percentage / 100)));
        findProduct.productOffer = parseInt(percentage);
        await findProduct.save();
        findCategory.categoryOffer = 0;
        await findCategory.save();
        res.json({status:true});
    } catch (error) {
        res.redirect("/pageerror");
        res.status(500).json({status:false,message:"Internal Server Error"})
        
    }
};

const removeProductOffer = async (req,res)=>{
    try {
        const {productId} = req.body
        const findProduct = await Product.findOne({_id:productId});
        const percentage = findProduct.productOffer;
        findProduct.salePrice = Math.floor(findProduct.regularPrice - (findProduct.regularPrice * (percentage / 100)));
        findProduct.productOffer = 0,
        await findProduct.save();
        res.json({status:true})

    } catch (error) {
        res.redirect("/admin/pageerror")
        
    }
}


const getEditProduct = async (req,res)=>{
    try {
        const id = req.query.id;
        const product = await Product.findOne({_id:id});
        const category = await Category.find({});
        res.render("edit-product",{
            product:product,
            cat:category,   
        })


    } catch (error) {
       res.redirec('/pageerror'); 
    }
}


const editProduct = async (req,res)=>{
    try {
        const id = req.params.id;
        const product = await Product.findOne({_id:id});
        const existingproduct = await Product.findOne({
            productName:data.productName,
            _id:{$ne:id}
        })

        if(existingproduct){
            return res.status(400).json({error:"Product with this name already exists. Please try another name"});
        }

        const images = [];

        if(req.files && req.files.length>0){
            for(let i=0;i<req.files.length;i++){
                images.push(req.files[i].filename);
            }
        }

        const updateFields = {
            productName:data.productName,
            description:data.description,
            category:product.category,
            regularPrice:data.regularPrice,
            salePrice:data.salePrice,
            quantity:data.quantity,
            size: data.size,
            color:data.color
        }

        if(req.files.length>0){
            updateFields.$push = {productImage:{$each:images}};
        }

        await Product.findByIdAndUpdate(id,updateFields,{new:true});
        res.redirect("/admin/products");
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");
    }
}



const deleteSingleImage = async (req,res)=>{
    try {
        const{imageNameToServer,productIdToServer} = req.body;
        const product = await Product.findByIdAndDelete(productIdToServer,{$pull:{productImage:imageNameToServer}});
        const imagePath = path.join("public","uploads","re-image",imageNameToServer);
        if(fs.existsSync(imagePath)){
            await fs.unlinkSync(imagePath);
            console.log(`Image ${imageNameToServer} deleted successfully`);

        }else{
            console.log(`Image ${imageNameToServer} not found`);
        }
        res.send({status:true});
    } catch (error) {
        res.redirect("/pageerror")
    }
}




module.exports ={
    getProductAddPage,
    addProducts,
    getAllProducts,
    addProductOffer,
    removeProductOffer,
    getEditProduct,
    editProduct,
    deleteSingleImage,
};