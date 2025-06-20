import { User } from "../models/user_model.js";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { z } from "zod"; // Import Zod for validation
import jwt from "jsonwebtoken"; // Import JWT for token generation
import dotenv from 'dotenv'; // Import dotenv for environment variables
import { item } from "../models/item_model.js";
import { Purchase } from "../models/purchase.model.js";
dotenv.config(); // Load environment variables from .env file

// Define Zod schema for validation
const userSchema = z.object({
    firstName: z.string().min(3, "First name is required & atleast of 3 characters"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
    password: z.string().min(8, "Password must be at least 8 characters long")
        .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, "Password must include one uppercase letter, one lowercase letter, one digit, and one special character"),
});

// Import zod at the top if not already
const signUp = async (req, res) => {
    try {
        // Validate input using Zod
        const validatedData = userSchema.parse(req.body);

        // Check if email or mobile already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const existingMobile = await User.findOne({ mobile: validatedData.mobile });
        if (existingMobile) {
            return res.status(400).json({ error: "Mobile number already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Only allow isSeller if passed and truthy (you can also add seller-auth logic here)
        const isSeller = req.body.isSeller === true || req.body.isSeller === "true"; // Accepts string "true" or boolean true

        // Create a new User
        const newUser = new User({
            ...validatedData,
            password: hashedPassword,
            isSeller
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email, isSeller: newUser.isSeller },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Set cookie
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };

        res.cookie("jwt", token, cookieOptions);

        res.status(201).json({
            message: "Successfully signed up and logged in",
            token,
            user: newUser
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const signIn = async (req, res) => {
    try {
        // Validate input
        const validatedData = userSchema.pick({ email: true, password: true }).parse(req.body);

        // Find user
        const user = await User.findOne({ email: validatedData.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, isSeller: user.isSeller },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // Set cookie
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict"
        };

        res.cookie("jwt", token, cookieOptions);

        res.status(200).json({ message: "Successfully signed in", token, user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error signing in user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const updateUser = async (req, res) => {
  const userId = req.userId;

  try {
    const { oldPassword, password, ...updateFields } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) return res.status(404).json({ error: "User not found" });

    if (!oldPassword) return res.status(400).json({ error: "Current password is required." });

    const isPasswordValid = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Incorrect current password." });

    let schema = userSchema.partial();
    if (!password) {
      schema = schema.omit({ password: true });
    }

    const validatedData = schema.parse(updateFields);

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      validatedData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: validatedData }, { new: true, runValidators: true });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
    const userId = req.userId; // Assuming user ID is stored in req.user
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        console.error("Error deleting User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getUsers = async (req, res) => {
    try {
        // Retrieve all non-seller users from the database
        const users = await User.find({ isSeller: false });

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "No non-seller users found" });
        }

        res.status(200).json({ message: "Non-seller users retrieved successfully", users });
    } catch (error) {
        console.error("Error retrieving Users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getSellers = async (req, res) => {
    try {
        // Retrieve all seller users from the database
        const sellers = await User.find({ isSeller: true });

        if (!sellers || sellers.length === 0) {
            return res.status(404).json({ error: "No seller users found" });
        }

        res.status(200).json({ message: "Seller users retrieved successfully", sellers });
    } catch (error) {
        console.error("Error retrieving Sellers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};   


const getAllPurchases = async (req,res) => {
    const userId=req.userId;
    try {
        const purchases=await Purchase.find({userId})

        let purchasedItemId=[]
        for(let i=0;i<purchases.length;i++){
            purchasedItemId.push(purchases[i].itemId)  
        }

        let itemData = [];
        if (purchasedItemId.length > 0) {
            itemData = await item.find({
                _id: {$in:purchasedItemId}
            });
        }
        
        console.log("Purchases:", purchases);
        console.log("Items:", itemData);
        
        res.status(200).json({
            purchases: purchases || [], 
            items: itemData || []
        });
    } catch (error) {
        console.log("Error in Purchase", error);
        res.status(500).json({error: "Error in Purchase"})
    }
}

const signOut = (req, res) => {
    try {   
        if(!req.cookies.jwt) {
            return res.status(400).json({ error: "No active session found.Please login" });
        }
        res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        
        // Respond with a success message
        res.status(200).json({ message: "Successfully signed out" });
    } catch (error) {
        console.error("Error signing out User:", error);
        res.status(500).json({ error: "Internal server error" });
    }   
}

const getDetails = async (req, res) => {
    const userId = req.userId; // Assuming user ID is stored in req.user

    try {
        // Find the user by ID
        const user = await User.findById(userId).select("-password"); // Only exclude password
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }   
        res.status(200).json({ message: "User retrieved successfully", user });
    } catch (error) {
        console.error("Error retrieving User details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const checkLoginStatus = (req, res) => {
    if (req.userId) {
        return res.status(200).json({ loggedIn: true, user: req.user });
    }
    res.status(401).json({ loggedIn: false });
};

export {getAllPurchases, getDetails, getUsers, getSellers, deleteUser, signUp, signIn, signOut, updateUser, checkLoginStatus };
