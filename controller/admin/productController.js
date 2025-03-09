const Product = require('../../models/productSchema');
const Category = require('../../models/categorySchema');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const uploadDir = path.join('public', 'Uploads', 'product-Images');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📂 Upload directory created: ${uploadDir}`);
}

// Function to validate image files before processing
const validateImage = async (imagePath) => {
    try {
        const metadata = await sharp(imagePath).metadata();
        return metadata && metadata.format; // Ensure it's a valid image format
    } catch (err) {
        console.error(`❌ Invalid or corrupt image file: ${imagePath}`, err);
        return false;
    }
};

const loadAddProduct = async (req, res) => {
    try {
        const category = await Category.find({ isListed: true });
        res.render('addProducts', { cat: category });
    } catch (error) {
        console.error('❌ Error loading add product page:', error);
        res.redirect('/admin/pageNotFound');
    }
};

const addProducts = async (req, res) => {
    try {
        const products = req.body;
        console.log("📩 Received product data:", products);

        const productExists = await Product.findOne({ productName: products.productName });

        if (productExists) {
            return res.status(400).json({ error: "Product already exists, please try another name" });
        }

        if (!req.files || req.files.length === 0) {
            console.error("❌ No image files uploaded.");
            return res.status(400).json({ error: "No image files uploaded." });
        }

        console.log('📂 Uploaded files:', req.files.map(f => f.path));

        const images = [];

        for (const file of req.files) {
            const originalImagePath = file.path;
            const resizedImagePath = path.join(uploadDir, file.filename);

            if (!fs.existsSync(originalImagePath)) {
                console.error(`❌ File not found: ${originalImagePath}`);
                continue;
            }

            const isValid = await validateImage(originalImagePath);
            if (!isValid) {
                console.error(`⏩ Skipping invalid image: ${originalImagePath}`);
                continue;
            }

            try {
                await sharp(originalImagePath)
                    .resize({ width: 440, height: 440 })
                    .toFile(resizedImagePath);

                images.push(file.filename);
                console.log(`✅ Image processed successfully: ${file.filename}`);
            } catch (err) {
                console.error(`❌ Error processing image ${file.filename}:`, err);
            }
        }

        if (images.length === 0) {
            console.error("❌ No valid images processed.");
            return res.status(400).json({ error: "No valid images processed." });
        }

        const categoryId = await Category.findOne({ name: products.category });

        if (!categoryId) {
            console.error("❌ Invalid category name.");
            return res.status(400).json({ error: "Invalid category name" });
        }

        console.log('📌 Category ID:', categoryId._id);

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
            productImage: images, // Store only valid images
            status: "Available",
        });

        await newProduct.save();
        console.log("✅ New product saved:", newProduct);

        return res.redirect('/admin/addProducts');

    } catch (error) {
        console.error('❌ Error saving product:', error);
        return res.redirect('/admin/pageNotFound');
    }
};

module.exports = {
    loadAddProduct,
    addProducts,
};
