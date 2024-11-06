const Product = require("../../models/productSchema");
const Category = require("../../models/categorySchema");
const User = require("../../models/productSchema");




const getProductPage = async (req, res) => {
    try {
        
        const products = await Product.find({
            isBlocked: false,
            quantity: { $gt: 0 }
        }).select('productName salePrice productImage status quantity'); 

        
        const productData = products.map(product => ({
            _id: product._id,
            productName: product.productName,
            price: product.salePrice, 
            productImage: product.productImage, 
            status: product.quantity > 1 ? 'Available' : 'out of stock'
        }));

        res.render('product', { products: productData });
        console.log("Product Data:", productData);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    getProductPage,
}



