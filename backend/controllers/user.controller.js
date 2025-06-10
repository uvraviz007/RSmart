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

const signUp = async (req, res) => {
    try {
        // Validate input using Zod
        const validatedData = userSchema.parse(req.body);

        // Check if email already exists
        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const existingMobile = await User.findOne({ email: validatedData.mobile });
        if (existingMobile) {
            return res.status(400).json({ error: "Number already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create a new instance of the User model
        const newUser = new User({
            ...validatedData,
            password: hashedPassword, // Save hashed password
        });

        // Disable Mongoose validation for the hashed password
        newUser.validateSync = function () {}; // Override validation for this instance

        // Save the User to the database
        await newUser.save();

        // Respond with the created User
        res.status(201).json({ message: "Successfully signed up", user: newUser });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error creating User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const signIn = async (req, res) => {
    try {
        // Validate input using Zod
        const validatedData = userSchema.pick({ email: true, password: true }).parse(req.body);
        
        // Find the user by email
        const user = await User.findOne({ email: validatedData.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the password matches the hashed password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        console.log(console.JWT_SECRET)
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        );
        // Respond with the authenticated user
        const cookieOption={
            expires: new Date(Date.now() + 24*60*60*1000),
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'Strict' //csrf attack prevention
        }
        res.cookie('jwt',token)
        res.status(200).json({ message: "Successfully signed in", token, user });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error signing in User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateUser = async (req, res) => {
    const { userId } = req.params;
    const currUserId = req.userId; // Assuming user ID is stored in req.user
    try {
        // Validate input using Zod
        if (userId !== currUserId) {
            return res.status(403).json({ error: "You can only update your own profile" });
        }
        const validatedData = userSchema.partial().parse(req.body);

        // Find the existing user
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Hash the password if it is being updated
        const updateFields = {};
        if (validatedData.firstName !== undefined) updateFields.firstName = validatedData.firstName;
        if (validatedData.email !== undefined) updateFields.email = validatedData.email;
        if (validatedData.mobile !== undefined) updateFields.mobile = validatedData.mobile;
        if (validatedData.password !== undefined) {
            updateFields.password = await bcrypt.hash(validatedData.password, 10);
        }

        // Update the user in the database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error updating User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.params;
    const currUserId = req.userId; // Assuming user ID is stored in req.user
    try {
        if( userId !== currUserId) {    
            return res.status(403).json({ error: "You can only delete your own profile" });
        }
        
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
        // Retrieve all Users from the database
        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }

        res.status(200).json({ message: "Users retrieved successfully", users });
    } catch (error) {
        console.error("Error retrieving Users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const getAllPurchases = async (req,res) => {
//    console.log("Fetching all purchases..."); 
    const userId=req.userId;
    // console.log("user Id:", userId);
    try {
        const purchase=await Purchase.find({userId})

        let purchasedItemId=[]
        for(let i=0;i<purchase.length;i++){
            purchasedItemId.push(purchase[i].itemId)  
        }

        const itemData=await item.find({
            _id: {$in:purchasedItemId}
        })
        console.log(itemData);
        res.status(200).json({purchases: purchase, items: itemData})
    } catch (error) {
        console.log("Error in Purchase", error);
        res.status(500).json({errors: "Error in Purchase"})
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

const getUserDetails = async (req, res) => {
    const userId = req.userId; // Assuming user ID is stored in req.user

    try {
        // Find the user by ID
        const user = await User.findById(userId).select("-password"); // Exclude password from response
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }   
        res.status(200).json({ message: "User retrieved successfully", user });
    } catch (error) {
        console.error("Error retrieving User details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export {getAllPurchases, getUserDetails,getUsers, deleteUser, signUp, signIn, signOut, updateUser };