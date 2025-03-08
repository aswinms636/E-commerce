const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const User = require('../../models/userSchema');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const loadAddProduct = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true });
        res.render('addProducts', { cat: category });
    } catch (error) {
        res.redirect('/admin/pageNotFound');
    }
};

const addProducts = async (req, res) => {
    try {
        const products = req.body;
        console.log(products)
        const productExists = await Product.findOne({ productName: products.productName });

        if (!productExists) {
            const images = [];

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const originalImagePath = file.path;
                    const resizedImagesPath = path.join('public', 'uploads', 'product-Images', file.filename);

                    await sharp(originalImagePath)
                        .resize({ width: 440, height: 440 })
                        .toFile(resizedImagesPath);

                    images.push(file.filename);
                }
            }

            const categoryId = await Category.findOne({ name: products.category });
            console.log('Category : ',categoryId)

            if (!categoryId) {
                return res.status(400).json({ error: "Invalid category name" });
            }

            const newProduct = new Product({
                productName: products.productName,
                description: products.description,
                brand: products.brand,
                category: categoryId._id,
                regularPrice: products.regularPrice,
                salePrice: products.salePrice,
                createdOn: new Date(),
                quantity: products.quantity,
                size: products.size,
                color: products.color,
                productImage: products.images,
                status: "Available",
            });

            await newProduct.save();
            console.log("new product",newProduct)
            return res.redirect('/admin/addProducts');

        } else {
            return res.status(400).json({ error: "Product already exists, please try with another name" });
        }
    } catch (error) {
        console.error('Error saving product:', error);
        return res.redirect('/admin/pageNotFound');
    }
};

module.exports = {
    loadAddProduct,
    addProducts,
};
