import { Admin } from "../models/admin_model.js";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing
import { z } from "zod"; // Import Zod for validation
import jwt from "jsonwebtoken"; // Import JWT for token generation
import dotenv from 'dotenv'; // Import dotenv for environment variables
import { item } from "../models/item_model.js";
dotenv.config(); // Load environment variables from .env file

// Define Zod schema for validation
const adminSchema = z.object({
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
        const validatedData = adminSchema.parse(req.body);

        // Check if email already exists
        const existingAdmin = await Admin.findOne({ email: validatedData.email });
        if (existingAdmin) {
            return res.status(400).json({ error: "Email already exists" });
        }
        const existingMobile = await Admin.findOne({ mobile: validatedData.mobile });
        if (existingMobile) {
            return res.status(400).json({ error: "Number already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create a new instance of the Admin model
        const newAdmin = new Admin({
            ...validatedData,
            password: hashedPassword, // Save hashed password
        });

        // Disable Mongoose validation for the hashed password
        newAdmin.validateSync = function () {}; // Override validation for this instance

        // Save the Admin to the database
        await newAdmin.save();

        // Respond with the created Admin
        res.status(201).json({ message: "Successfully signed up", admin: newAdmin });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error creating Admin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const signIn = async (req, res) => {
    try {
        // Validate input using Zod
        const validatedData = adminSchema.pick({ email: true, password: true }).parse(req.body);
        
        // Find the admin by email
        const admin = await Admin.findOne({ email: validatedData.email });
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        // Check if the password matches the hashed password
        const isPasswordValid = await bcrypt.compare(validatedData.password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        console.log(console.JWT_ADMIN_SECRET)
        const token = jwt.sign(
            { adminId: admin._id, email: admin.email },
            process.env.JWT_ADMIN_SECRET,
            {expiresIn: "1d"}
        );
        // Respond with the authenticated Admin
        const cookieOption={
            expires: new Date(Date.now() + 24*60*60*1000),
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'Strict' //csrf attack prevention
        }
        res.cookie('jwt',token)
        res.status(200).json({ message: "Successfully signed in", token, admin });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error signing in Admin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateAdmin = async (req, res) => {
    const { adminId } = req.params;
    const currAdminId= req.adminId; // Ensure adminId is present (adjust as per your middleware)
    try {
        // Validate input using Zod
        if( adminId !== currAdminId) {
            return res.status(403).json({ error: "You are not authorized to update this Admin" });
        }
        const validatedData = adminSchema.partial().parse(req.body);

        // Find the existing Admin
        const existingAdmin = await Admin.findById(adminId);
        // console.log("Existing Admin:", existingAdmin); // Debugging line
        if (!existingAdmin) {
            return res.status(404).json({ error: "Admin not found" });
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
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "Admin updated successfully", Admin: updatedAdmin });
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors
            return res.status(400).json({ error: error.errors });
        }
        console.error("Error updating Admin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteAdmin = async (req, res) => {
    const { adminId } = req.params;
    const currAdminId = req.adminId; // Ensure adminId is present (adjust as per your middleware)
    try {
        if( adminId !== currAdminId) {
            return res.status(403).json({ error: "You are not authorized to delete this Admin" });
        }
        const deletedAdmin = await Admin.findByIdAndDelete(adminId);
        if (!deletedAdmin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.status(200).json({ message: "Admin deleted successfully", admin: deletedAdmin });
    } catch (error) {
        console.error("Error deleting Admin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getAdmins = async (req, res) => {
    try {
        // Retrieve all Admins from the database
        const admins = await Admin.find();

        if (!admins || admins.length === 0) {
            return res.status(404).json({ error: "No Admins found" });
        }

        res.status(200).json({ message: "Admins retrieved successfully", admins });
    } catch (error) {
        console.error("Error retrieving Admins:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const signOut = (req, res) => {
    // Clear the JWT cookie
    try {
        if(!req.cookies.jwt) {
            return res.status(400).json({ error: "No active session found.Please login" });
        }
        res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({ message: "Successfully signed out" });
    } catch (error) {
        console.error("Error signing out:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getAdminDetails = async (req, res) => {
    const {adminId} = req.params; // Get the admin ID from the request

    try {
        // Find the admin by ID
        const admin = await Admin.findById(adminId).select("-password"); // Exclude password from response
        console.log("Admin ID:", adminId); // Debugging line
        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.status(200).json({ message: "Admin details retrieved successfully", admin });
    } catch (error) {
        console.error("Error retrieving Admin details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export {getAdminDetails, signOut, signUp, signIn, updateAdmin, deleteAdmin, getAdmins};