const User = require('../../models/userSchema');

const custermerInfo = async (req, res) => {
    try {
        let search = req.query.search || '';
        let page = parseInt(req.query.page) || 1;
        const limit = 3;

        // Fetch users from the database
        const userData = await User.find({
            isAdmin: false,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } }
            ]
        })
        .limit(limit)
        .skip((page - 1) * limit)
        .exec();

        // Get total count for pagination
        const count = await User.countDocuments({
            isAdmin: false,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } }
            ],
        });

        // Pass the required data to the EJS template
        res.render('customers', {
            data: userData, // Fix: Passing userData as "data"
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });

    } catch (error) {
        console.error("Error fetching customer data:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    custermerInfo
};
