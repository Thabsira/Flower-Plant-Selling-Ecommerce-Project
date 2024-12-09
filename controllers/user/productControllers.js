const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/productSchema");
const { productDetails } = require("./userController");
const mongoose = require('mongoose');



const getCategoriesWithProductCount = async () => {
    return await Category.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: 'category',
                as: 'products',
            },
        },
        {
            $project: {
                _id: 1,
                name: 1,
                productCount: { $size: '$products' },
            },
        },
    ]);
};

const getProductPage = async (req, res) => {
    try {
        const { sortOption, page = 1, categoryId } = req.query;
        console.log('Received Query Parameters:', req.query);

        let productQuery = { isBlocked: false, quantity: { $gte: 1 } };
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            productQuery.category = categoryId; 
        }
        console.log('Product Query:', productQuery);
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

        console.log('Sort Condition:', sortCondition);

        const categoriesWithCount = await getCategoriesWithProductCount();
        console.log('Categories with Product Count:', categoriesWithCount);

        const pageSize = 10;
        const skip = (page - 1) * pageSize;

        const products = await Product.find(productQuery)
            .sort(sortCondition)
            .skip(skip)
            .limit(pageSize)
            .select('productName regularPrice salePrice productImage status quantity description category');

        const productData = products.map(product => ({
            _id: product._id,
            productName: product.productName,
            price: product.regularPrice,
            productImage: product.productImage,
            status: product.quantity > 1 ? 'Available' : 'Out of Stock',
            description: product.description,
        }));

        const totalProducts = await Product.countDocuments(productQuery);
        const totalPages = Math.ceil(totalProducts / pageSize);

        console.log('Total Products:', totalProducts);
        res.render('product', {
            products: productData,
            selectedSort: sortOption || '',
            categories: categoriesWithCount,
            selectedCategory: categoryId || '',
            currentPage: parseInt(page),
            totalPages,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server Error");
    }
};






const getSearchSuggestions = async (req, res) => {
    const query = req.query.query;
    console.log('Search query received:', query); 
    try {
        if (!query || query.length === 0) {
            return res.status(400).json({ success: false, message: 'Query parameter is missing or empty' });
        }

        const products = await Product.find({
            productName: { $regex: query, $options: 'i' }, 
            status: 'Available',
            isBlocked: false
        }).limit(5);

        console.log('Products found:', products); 
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'No products found' });
        }
        const suggestions = products.map(product => ({
            productId: product._id,
            productName: product.productName
        }));

        return res.json({ success: true, suggestions });
    } catch (error) {
        console.error(error); 
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


module.exports = {
    getProductPage,
    productDetails,
    getSearchSuggestions,
}



