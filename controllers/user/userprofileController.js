const User = require("../../models/userSchema");
const Cart = require("../../models/cartSchema");
const Wishlist = require("../../models/wishlistSchema");

/*const getUserProfile = async(req,res)=>{
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).send('User not authenticated');
        }


        const user = await User.findById(userId).populate('orderHistory wishlist cart searchHistory.category');

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('profile',{user});
    } catch (error) {
        console.error(err);
        res.status(500).send("Server Error")
    }
};*/




/*const getUserProfile = async(req, res) => {
    try {
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).send('User not authenticated');
        }

        const user = await User.findById(userId)
            .populate('orderHistory wishlist cart searchHistory.category');

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('profile', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};*/



const getUserProfile = async (req, res) => {
    try {
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).send("User not authenticated");
        }

        const user = await User.findById(userId)
            .populate("orderHistory wishlist cart searchHistory.category");

        const addressDoc = await Address.findOne({ userId });

        // If addresses are found, pass them to the view, otherwise pass an empty array
        res.render("profile", { user, addresses: addressDoc ? addressDoc.address : [] });
    } catch (error) {
        console.error("Error loading profile:", error);
        res.status(500).send("Server Error");
    }
};







const geteditProfilePage = async (req, res) => {
    try {
        const userId = req.session.user;  // Assuming user is authenticated and session stores userId
        
        // Use async/await instead of a callback
        const user = await User.findById(userId);

        if (!user) {
            return res.redirect('/profile');
        }
        
        // Render the edit profile page with the found user
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


/*const addAddress = async (req, res) => {
    try {
        const userId = req.session.user; // Get the user ID from the session

        if (!userId) {
            return res.status(401).send('User not authenticated'); // Check if the user is authenticated
        }

        // Extract address details from the request body
        const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body;

        // Validate the data here as necessary

        // Create new address object
        const newAddress = {
            street,
            city,
            zipcode,
            phone,
        };

        // Update the user's addresses array by adding the new address
        await User.findByIdAndUpdate(userId, {
            $push: { addresses: newAddress } // Use $push to add new address to the addresses array
        }, { new: true });

        res.redirect('/userProfile'); // Redirect to user profile after adding address
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error"); // Handle server errors
    }
};*/



// In userprofileController.js
const Address = require("../../models/addressSchema");

const addAddress = async (req, res) => {
    try {
        const userId = req.session.user;

        // Gather address details from the form
        const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body;



        // Validation checks
       /* if (!addressType || !["Home", "Work", "Other"].includes(addressType)) {
            return res.status(400).send("Invalid address type.");
        }
        if (!name || name.length < 2 || name.length > 50 || !/^[A-Za-z\s]+$/.test(name)) {
            return res.status(400).send("Name must be 2-50 characters and contain only letters and spaces.");
        }
        if (!city || city.length < 2 || city.length > 50 || !/^[A-Za-z\s-]+$/.test(city)) {
            return res.status(400).send("City must be 2-50 characters and contain only letters, spaces, or hyphens.");
        }
        if (landMark && landMark.length > 100) {
            return res.status(400).send("Landmark can be up to 100 characters.");
        }
        if (!state || state.length < 2 || state.length > 50) {
            return res.status(400).send("State is required and must be between 2 and 50 characters.");
        }
        if (!pincode || !/^\d+$/.test(pincode) || pincode.length !== 6) {
            return res.status(400).send("Pincode must be exactly 6 digits.");
        }
        if (!phone || !/^\d{10,15}$/.test(phone)) {
            return res.status(400).send("Primary phone number must be 10-15 digits.");
        }
        if (altPhone && !/^\d{10,15}$/.test(altPhone)) {
            return res.status(400).send("Alternate phone number must be 10-15 digits.");
        }*/





        // Create or update the address document for the user
        let addressDoc = await Address.findOne({ userId });
        
        if (addressDoc) {
            // If the document already exists, add a new address to the addresses array
            addressDoc.address.push({ addressType, name, city, landMark, state, pincode, phone, altPhone });
        } else {
            // If no document exists for the user, create a new document with this address
            addressDoc = new Address({
                userId,
                address: [{ addressType, name, city, landMark, state, pincode, phone, altPhone }]
            });
        }

        // Save the document to the database
        await addressDoc.save();

        // Redirect back to the profile page to show the updated list of addresses
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
        const addressId = req.params.id; // Get the address ID from the URL

        if (!userId) {
            return res.status(401).send('User not authenticated');
        }

        // Find the address by ID
        const address = await Address.findOne({ userId, 'address._id': addressId }, { 'address.$': 1 });
        
        if (!address) {
            return res.status(404).send('Address not found');
        }

        // Render the edit address page with the found address
        res.render('edit-address', { address: address.address[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};



const updateAddress = async (req, res) => {
    try {
        const userId = req.session.user; 
        const addressId = req.params.id; // Get the address ID from the URL
        const { addressType, name, city, landMark, state, pincode, phone, altPhone } = req.body;

        // Update the address
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

        // Redirect back to the user profile page
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

        // Remove the address from the user's address list
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
