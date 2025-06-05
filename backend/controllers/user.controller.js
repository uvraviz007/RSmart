import { User } from "../models/user_model.js"; 

const signUp = async (req, res) => {
    const { firstName, lastName, email, mobile, password } = req.body;
    try {
        // Validate input
        if (!firstName || !email || !mobile || !password) {
            return res.status(400).json({ error: "All required fields must be provided" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists" });
        }

        // Create a new instance of the User model
        const newUser = new User({
            firstName,
            lastName,
            email,
            mobile,
            password,
        });

        // Save the User to the database
        await newUser.save();

        // Respond with the created User
        res.status(201).json({ message: "Successfully signed up", user: newUser });
    } catch (error) {
        console.error("Error creating User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the password matches
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }

        // Respond with the authenticated user
        res.status(200).json({ message: "successfully signed in", user });
    } catch (error) {
        console.error("Error signing in User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, email, mobile, password } = req.body;

    try {
        // Find and update the User
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { firstName, lastName, email, mobile, password },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating User:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteUser = async (req, res) => {
    const { userId } = req.params;
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

const userDetails = async (req, res) => {
    const { userId } = req.params;

    try {
        // Find the User by ID
        const userDetail = await User.findById(userId);

        if (!userDetail) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User retrieved successfully", user: userDetail });
    } catch (error) {
        console.error("Error retrieving User details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export { userDetails, getUsers, deleteUser, signUp, signIn, updateUser };