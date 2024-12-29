const Category = require("../../models/categorySchema");
const Product = require("../../models/productSchema")


const categoryInfo = async (req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;
        const skip = (page-1)*limit;
        const categoryData = await Category.find({})
        .sort({createdAt:-1})
        .skip(skip)
        .limit(limit)
        const totalCategories = await Category.countDocuments({});
        const totalPages = Math.ceil(totalCategories/limit);
        res.render("category",{
            cat:categoryData,
            currentPage:page,
            totalPages : totalPages,
            totalCategories : totalCategories

        });

    } catch (error) {
       
        console.error(error);
        res.redirect("/pageerror")
    }
}


const addCategory = async (req,res)=>{
    const {name,description} = req.body;
    try {
        const existingCategory = await Category.findOne({name});
        if(existingCategory){
            return res.status(400).json({error:"Category already exists"})
        }
        const newCategory = new Category({
            name,
            description,
        })
        await newCategory.save();
        return res.json({message:"category added successfully"})
    } catch (error) {
        return res.status(500).json({error:"Internal server Error"})
    }
};





const addCategoryOffer = async (req, res) => {
    try {
        const percentage = parseInt(req.body.percentage);
          // Validate the offer percentage
          if (percentage <= 0 || percentage > 90) {
            return res.status(400).json({ 
                status: false, 
                message: "Offer percentage must be greater than 0 and not exceed 90%" 
            });
        }
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ status: false, message: "Category not found" });
        }
        const products = await Product.find({ category: category._id });
        const hasProductOffer = products.some((product) => product.productOffer > percentage);

        if (hasProductOffer) {
            return res.json({ status: false, message: "Products within this category already have a higher offer" });
        }
        await Category.updateOne({ _id: categoryId }, { $set: { categoryOffer: percentage } });
        for (const product of products) {
            const salePrice = product.regularPrice - (product.regularPrice * (percentage / 100));
            product.salePrice = Math.floor(salePrice);
            product.productOffer = 0; 
            await product.save();
        }

        res.json({ status: true, message: "Offer added successfully" });
    } catch (error) {
        console.error("Error adding category offer:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};





const removeCategoryOffer = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ status: false, message: "Category not found" });
        }

        const percentage = category.categoryOffer;
        const products = await Product.find({ category: category._id });

        if (products.length > 0) {
            for (const product of products) {
                product.salePrice = product.regularPrice;

                if (product.productOffer > 0) {
                    const salePrice = product.regularPrice - (product.regularPrice * (product.productOffer / 100));
                    product.salePrice = Math.floor(salePrice);
                }

                await product.save();
            }
        }

        category.categoryOffer = 0;
        await category.save();

        res.json({ status: true, message: "Category offer removed successfully" });
    } catch (error) {
        console.error("Error removing category offer:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};



const getListCategory = async(req,res)=>{
    try {
        let id=req.query.id;
        await Category.updateOne({_id:id},{$set:{isListed:false}});
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/pageerror")
    }
}

const getUnlistCategory = async (req,res)=>{
    try {
        let id = req.query.id;
        await Category.updateOne({_id:id},{$set:{isListed:true}});
        res.redirect("/admin/category");
    } catch (error) {
        res.redirect("/pageerror")
        
    }
}


const getEditCategory = async (req,res)=>{
    try{
    const id = req.query.id;
    const category = await Category.findOne({_id:id});
    res.render("edit-category",{category:category});
    }catch(error){
        res.redirect("/pageerror")
    }
};




  const editCategory = async (req, res) => {
    try {
        console.log('Form data:', req.body); 

        const id = req.params.id;
        const { name, description } = req.body;
        const existingCategory = await Category.findOne({ name: name, _id: { $ne: id } });
        if (existingCategory) {
            return res.status(400).json({ error: "Category exists, Please choose another name" });
        }

        console.log('Updating category with ID:', id);
        console.log('New name:', name);
        console.log('New description:', description);

        const updateCategory = await Category.findByIdAndUpdate(
            id,
            { name, description },
            { new: true }
        );

        if (updateCategory) {
            res.json({ success: true, message: 'Category updated successfully' });
        } else {
            res.status(404).json({ error: "Category Not Found" });
        }

    } catch (error) {
        console.error("Error during category update:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

  



const blockCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isBlocked: true } });
        res.redirect("/admin/category");  
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");  
    }
};


const unblockCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isBlocked: false } });
        res.redirect("/admin/category");  
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");  
    }
};


const softDeleteCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isDeleted: true } });
        res.redirect("/admin/category");  
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");  
    }
};



const restoreCategory = async (req, res) => {
    try {
        const id = req.query.id;
        await Category.updateOne({ _id: id }, { $set: { isDeleted: false } });
        res.redirect("/admin/category");  
    } catch (error) {
        console.error(error);
        res.redirect("/pageerror");  
    }
};







module.exports={
    categoryInfo,
    addCategory,
    addCategoryOffer,
    removeCategoryOffer,
    getListCategory,
    getUnlistCategory,
    getEditCategory,
    editCategory,
    unblockCategory,
    blockCategory,
    softDeleteCategory, 
    restoreCategory ,  

}


