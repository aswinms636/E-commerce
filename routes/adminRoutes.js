
const express=require('express')
const router=express.Router()
const adminController=require('../controller/admin/adminController')
const customerController=require('../controller/admin/customerController')
const categoryController=require('../controller/admin/categoryController')
const productController=require('../controller/admin/productController')
const multer=require('multer')
const path=require('path')

router.get('/pageNotFound',adminController.pageNotFound);

router.get('/login',adminController.loadlogin)
router.post('/adminLogin',adminController.adminLogin)
router.get('/dashboard',adminController.loadDashboard)
router.post('/logout',adminController.logout)


router.get('/blockCustomer', adminController.blockUser);
router.get('/unblockCustomer', adminController.unblockUser);
router.get('/users',customerController.custermerInfo)

router.get('/category',categoryController.categoryInfo)
router.post('/addCategory',categoryController.addCategory)
router.post('/addCategoryOffer',categoryController.addCategoryOffer)
router.post('/removeCategoryOffer',categoryController.removeCategoryOffer)
router.get('/listCategory',categoryController.listCategory);
router.get('/unlistCategory',categoryController.unlistCategory);
router.get('/editCategory/:id',categoryController.loadEditCategory)
router.post('/editCategory/:id',categoryController.editCategory)






const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/Uploads/'); // Define the directory where files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const uploads = multer({
    storage: storage,
   
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: function (req, file, cb) {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extname && mimeType) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
    
});

router.get('/addProducts',productController.loadAddProduct)
router.post('/addProducts',uploads.array('images',4),productController.addProducts)















module.exports=router













