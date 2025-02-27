

const User = require('../../models/userSchema');
const bcrypt=require('bcrypt')  
const nodemailer=require('nodemailer')



const loadHomePage = async (req, res) => {
    try {
        const user = req.session.user; 

        if (user) {
            if (user.isBlocked) {
                console.log('User is blocked');
                req.session.destroy()
               return  res.render('login')
            } else {
                res.render('home', { user });
            }
        } else {
            res.render('home');
        }

    } catch (error) {
        console.error('Home page not found:', error);
        res.status(500).send('Server error');
    }
};


const loadForgotPasswordPage=async(req,res)=>{
    try {
        res.render('forgotPassword')
    } catch (error) {
        res.status(500)
    }
}

const pageNotFound= async (req,res)=>{
    try {
        res.render('page-404')
    } catch (error) {
        res.redirect('/pageNotFound')
    }
}


const loadsignin= async (req, res) => {
    try {
        res.render('login'); 
    } catch (error) {
        console.error('Error rendering signup page:', error);
        res.status(500).send('Server error');
    }
};


const loadSingnup=async (req,res)=>{
    try {
        res.render('signup',{
            message:req.flash('error')
        })
    } catch (error) {
        res.status(500).send('Server error');
    }
}

function generateOtp(){
    return Math.floor(100000 + Math.random()*900000).toString();
}

async function otpSend(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.VERIFY_EMAIL, // Ensure this is set in .env
                pass: process.env.EMAIL_PASSWORD // Ensure this is correct
            }
        });

        const info = await transporter.sendMail({
            from: process.env.VERIFY_EMAIL,
            to: email,
            subject: 'Your OTP for Sign-up verification',
            text: `Your OTP is ${otp}`,
        });

        console.log('hii')
        console.log(`Your otp is ${otp}`)
        return info.accepted.length > 0;
        
    } catch (error) {
        console.error("Error sending email:", error.message);
        return false;
    }
}




async function resetPasswordOtp(email, otp) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.VERIFY_EMAIL, 
                pass: process.env.EMAIL_PASSWORD 
            }
        });

        const info = await transporter.sendMail({
            from: process.env.VERIFY_EMAIL,
            to: email,
            subject: 'Your OTP for Reset your Password',
            text: `Your OTP is ${otp}`,
        });

        
        console.log(`Your otp is ${otp}`)
        return info.accepted.length > 0;
        
    } catch (error) {
        console.error("Error sending email:", error.message);
        return false;
    }
}


const signup = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        console.log(req.body);

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/signup');
        }

        const user = await User.findOne({ email });
        if (user) {
            console.log('user')
            req.flash('error', 'User already exists!');
            return res.redirect('/signup');
        }
        

        const otp = generateOtp();
        const emailSent = await otpSend(email, otp);
        if (!emailSent) {
            req.flash('error', 'Error sending OTP, try again.');
            return res.redirect('/signup');
        }
        

        req.session.otp = otp;
        req.session.userData = { name, email, password };
       
        console.log('Redirecting to OTP verification page');
        return res.redirect('/otp-Page');

    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).send('Server error');
    }
};


const verifyOtp = async (req, res) => {
    try {
        
        const { otp } = req.body;

        if ( req.session.otp === otp) {

            const { name, email, password } = req.session.userData;
            console.log(name)

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            const newUser = new User({ name, email,password: hashedPassword });
            console.log(newUser)
            await newUser.save();

            // req.session.otp = null;
            // req.session.userDetails = null;

            delete req.session.otp
            delete req.session.userData

            req.flash('success', 'Your account has been verified. Please log in.');
            return res.redirect('/login');
        } else {
            
            req.flash('error', 'Invalid OTP. Please try again.');
            return res.redirect('/otp-Page');
        }

    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).send('Server error');
    }
};



const loadOtpPage= async (req,res)=>{
    try {
        res.render('otpPage')
    } catch (error) {
        res.json('connot get otp page')
    }
} 


const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Sign in request:", req.body);

    
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error', 'User not found. Please sign up.');
      return res.redirect('/signup');
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Invalid credentials. Please try again.');
      return res.redirect('/login');
    }

    req.session.user = user;
    req.flash('success', 'Login successful!');
    return res.redirect('/'); 

  } catch (error) {
    console.error('Error in sign in:', error);
    return res.status(500).send('Server error');
  }
};

const resendOtp=async (req,res)=>{
try {
    const email=req.session.user
    console.log('resend',email)

   const otp= generateOtp()
    otpSend(email,otp)

    res.redirect('otpPage')
} catch (error) {
    res.status(500).json({ message: "Server error", error });
}
}


const logout=async (req,res)=>{
    try {
        req.session.user=null
        console.log('logout successfully')
        res.redirect('/')
    } catch (error) {
        return res.status(500).send('Server error');
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email);

        // Await the user search
        const user = await User.findOne({ email });
        console.log(user);

        if (!user) {
            req.flash('error', 'User not found. Check your email.');
            return res.redirect('/login');
        }

        const otp = generateOtp();
        console.log(otp);

        const emailSent = await resetPasswordOtp(email, otp);
        if (!emailSent) {
            req.flash('error', 'Error sending OTP, try again.');
            return res.redirect('/login');
        }

        req.session.otp = otp;
        req.session.email=email

        return res.render('otpVerify');
        
    } catch (error) {
        console.error('Error in verifyEmail:', error);
        req.flash('error', 'Server error, please try again.');
        return res.redirect('/forgot-Password');
    }
};



const otpVerify=async(req,res)=>{
    try {
        const {otp}=req.body
        console.log(otp)
        if(req.session.otp==otp){
            return res.redirect('/newPassword')
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}



const changePassword=async(req,res)=>{
    try {
        const {password, confirmPassword } = req.body;
        const email=req.session.email
        console.log(email)

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.password = hashedPassword;
        await user.save();
        console.log('password changed successfully',password)
        console.log(user)

        delete req.session.email
        delete req.session.otp

        res.redirect('/login')
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}



const loadPasswordPage=async(req,res)=>{
    try {
        res.render('newPassword')    
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}



    
module.exports = {
    loadHomePage,
    pageNotFound,
    loadsignin,
    loadSingnup,
    loadOtpPage,
    loadForgotPasswordPage,
    signup,
    verifyOtp,
    resendOtp,
    verifyEmail,
    otpVerify,
    signin,
    loadPasswordPage,
    changePassword,
    logout
};




