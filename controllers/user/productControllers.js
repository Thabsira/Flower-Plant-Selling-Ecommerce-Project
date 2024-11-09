const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/productSchema");
const { productDetails } = require("./userController");



const getProductPage = async (req, res) => {
 
    try {
        const { sortOption, categoryId } = req.query;  
        let sortCondition = {};  

        
        if (sortOption === "popularity") {
            sortCondition = { popularity: -1 };  
        } else if (sortOption === "priceLowHigh") {
            sortCondition = { salePrice: 1 };  
        } else if (sortOption === "priceHighLow") {
            sortCondition = { salePrice: -1 };  
        } else if (sortOption === "newArrivals") {
            sortCondition = { createdAt: -1 };  
        } else if (sortOption === "alphabetical") {
            sortCondition = { productName: 1 };  
        }

        
        const categoriesWithCount = await getCategoriesWithProductCount();

        
        let productQuery = { isBlocked: false, quantity: { $gt: 0 } };
        if (categoryId) {
            productQuery.category = categoryId;
        }

    
        const products = await Product.find(productQuery)
            .sort(sortCondition)
            .select('productName salePrice productImage status quantity description');

        const productData = products.map(product => ({
            _id: product._id,
            productName: product.productName,
            price: product.salePrice,
            productImage: product.productImage,
            status: product.quantity > 1 ? 'Available' : 'Out of Stock',
            description:product.description
        }));
        

        res.render('product', {
            products: productData,
            selectedSort: sortOption,
            categories: categoriesWithCount, 
            selectedCategory: categoryId  
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server Error");
    }
};




const getCategoriesWithProductCount = async () => {
    try {
    
        const categoriesWithCount = await Product.aggregate([
            {
                $match: { isBlocked: false, quantity: { $gt: 0 } } 
            },
            {
                $group: {
                    _id: '$category', 
                    count: { $sum: 1 }  
                }
            },
            {
                $lookup: {
                    from: 'categories', 
                    localField: '_id',   
                    foreignField: '_id',  
                    as: 'categoryInfo'    
                }
            },
            {
                $unwind: '$categoryInfo'  
            },
            {
                $project: {
                    _id: 0,         
                    categoryName: '$categoryInfo.name',  
                    productCount: '$count' 
                }
            }
        ]);

        return categoriesWithCount;
    } catch (error) {
        console.error("Error fetching categories with product count:", error);
        throw new Error("Unable to fetch categories with product count.");
    }
};


module.exports = {
    getProductPage,
    productDetails,
}



