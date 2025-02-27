const express = require('express');
const router = express.Router();
const userController = require('../controller/user/userController'); 
const userAuth=require('../middlewares/userAuth')



router.get('/pageNotFound', userController.pageNotFound);
router.get('/', userController.loadHomePage);
router.get('/signup',userAuth.isLogin,userController.loadSingnup)
router.post('/signup',userController.signup)
router.get('/otp-Page',userAuth.isLogin,userController.loadOtpPage)
router.post('/otp-Page',userController.verifyOtp)
router.get("/login",userAuth.isLogin,userController.loadsignin)
router.post('/verifyEmail',userController.verifyEmail)
router.get('/forgot-Password',userController.loadForgotPasswordPage)
router.get('resend-otp',userController.resendOtp)
router.post('/otpVerify',userController.otpVerify)
router.get('/newPassword',userController.loadPasswordPage)
router.post('/changePassword',userController.changePassword)
router.post('/login',userController.signin)
router.get('/logout',userController.logout)

module.exports = router;
