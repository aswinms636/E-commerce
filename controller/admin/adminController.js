const Admin = require('../../models/userSchema');
const User = require('../../models/userSchema');
const bcrypt=require('bcrypt')




const loadlogin=async (req,res)=>{
    try {
        res.render('admin-login')
    } catch (error) {
        res.status(500).send('server error')
        
    }
}


const adminLogin = async (req, res) => {
    try {
      console.log(req.body)
      const { email, password } = req.body;
      
      const admin = await Admin.findOne({ email });
      // console.log('admin',admin)
  
      if (!admin) {
        req.flash("error", "Admin not found!");
        return res.redirect("/admin/login");
      }
       
  
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        // console.log('ismatch')
        req.flash("error", "Invalid credentials!");
        return res.redirect("/admin/login");
      }

      req.session.admin = admin; 
      req.flash("success", "Login successful!");
      return res.redirect("/admin/dashboard");
  
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).send("Server error");
    }

  };

  




   const loadDashboard=async (req,res)=>{
    try {
      res.render('dashboard')
    } catch (error) {
      res.status(500).send("Server error");
    }
   }


   const logout=async (req,res)=>{
    try {
      req.session.admin=null
      res.redirect('/admin/login')
    } catch (error) {
      res.status(500).send(' logout error')
    }
   }



   const blockUser = async (req, res) => {
    try {
        const userId = req.query.id;
        await User.findByIdAndUpdate(userId, { isBlocked: true });
        res.redirect('/admin/users'); 
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Function to unblock a user
const unblockUser = async (req, res) => {
    try {
        const userId = req.query.id;
        await User.findByIdAndUpdate(userId, { isBlocked: false });
        res.redirect('/admin/users'); 
    } catch (error) {
        console.error('Error unblocking user:', error);
        res.status(500).send('Internal Server Error');
    }
};


const pageNotFound= async (req,res)=>{
  try {
      res.render('page-404')
  } catch (error) {
      res.redirect('/pageNotFound')
  }
}



  

module.exports={
    loadlogin,
    adminLogin,
    loadDashboard,
    blockUser,
    unblockUser,
    adminLogin,
    logout,
    pageNotFound
    
}