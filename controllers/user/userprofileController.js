const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Wishlist = require("../../models/wishlistSchema");



const getUserProfile = async (req, res) => {
    try {
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).send("User not authenticated");
        }
        const user = await User.findById(userId)
            .populate("orderHistory wishlist cart searchHistory.category");
        const addressDoc = await Address.findOne({ userId });
        res.render("profile", { user, addresses: addressDoc ? addressDoc.address : [] });
    } catch (error) {
        console.error("Error loading profile:", error);
        res.status(500).send("Server Error");
    }
};







const geteditProfilePage = async (req, res) => {
    try {
        const userId = req.session.user; 
        const user = await User.findById(userId);
        if (!user) {
            return res.redirect('/profile');
        }
        res.render('edit-profile', { user });
        console.log('Rendering edit-profile');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
       
    }
};

//edit profile post

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).send('User not authenticated');
        }
        const { name, email, phone } = req.body;
        await User.findByIdAndUpdate(userId, { name, email, phone }, { new: true });
        res.redirect('/userProfile');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};


//get add adresspage

const getAddAddressPage = async (req, res) => {
    try {
        const userId = req.session.user; 

        if (!userId) {
            return res.status(401).send('User not authenticated'); 
        }

        const user = await User.findById(userId); 

        if (!user) {
            return res.status(404).send('User not found'); 
        }

        res.render('add-address', { user }); 
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error"); 
    }
};





const Address = require("../../models/addressSchema");

const addAddress = async (req, res) => {
    try {
        const userId = req.session.user;
        const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body;
        let addressDoc = await Address.findOne({ userId });
        
        if (addressDoc) {
            addressDoc.address.push({ addressType, name, city, landMark, state, pincode, phone, altPhone });
        } else {
            addressDoc = new Address({
                userId,
                address: [{ addressType, name, city, landMark, state, pincode, phone, altPhone }]
            });
        }

        await addressDoc.save();
        res.redirect("/userProfile");
    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).send("Server Error");
    }
};



//get edit address

const getEditAddressPage = async (req, res) => {
    try {
        const userId = req.session.user; 
        const addressId = req.params.id; 

        if (!userId) {
            return res.status(401).send('User not authenticated');
        }
        const address = await Address.findOne({ userId, 'address._id': addressId }, { 'address.$': 1 });
        
        if (!address) {
            return res.status(404).send('Address not found');
        }
        res.render('edit-address', { address: address.address[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};



const updateAddress = async (req, res) => {
    try {
        const userId = req.session.user; 
        const addressId = req.params.id; 
        const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body;

        
        await Address.updateOne(
            { userId, 'address._id': addressId },
            { 
                $set: { 
                    'address.$.addressType': addressType,
                    'address.$.name': name,
                    'address.$.city': city,
                    'address.$.landMark': landMark,
                    'address.$.state': state,
                    'address.$.pincode': pincode,
                    'address.$.phone': phone,
                    'address.$.altPhone': altPhone
                }
            }
        );

        
        res.redirect("/userProfile");
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};



//delete

const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.user; 
        const addressId = req.params.id; 

        if (!userId) {
            return res.status(401).send('User not authenticated');
        }

        await Address.updateOne(
            { userId },
            { $pull: { address: { _id: addressId } } }
        );

        
        res.redirect("/userProfile");
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).send("Server Error");
    }
};







module.exports={
    getUserProfile,
    geteditProfilePage,
    updateUserProfile,
    getAddAddressPage,
    addAddress,
    getEditAddressPage,
    updateAddress,
    deleteAddress,
}
