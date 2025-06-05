import path from 'path'; // Import path module for file extension handling
import { item } from "../models/item_model.js"; // Ensure the item model is imported correctly
import { v2 as cloudinary } from 'cloudinary';

const createItem = async (req, res) => {
    const { name, description, price } = req.body;
    try {
        // Validate input
        if (!name || !description || !price) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: "Image file is required" });
        }

        const image = req.files.image.tempFilePath;
        const fileExtension = path.extname(req.files.image.name).toLowerCase(); // Extract file extension
        const allowedExtensions = ['.png', '.jpg', '.jpeg'];

        if (!allowedExtensions.includes(fileExtension)) {
            return res.status(400).json({ error: "Invalid image format. Only .png, .jpg, and .jpeg are allowed." });
        }

        // Upload image to Cloudinary
        const cloud_response = await cloudinary.uploader.upload(image, {
            folder: "items", // Optional: Specify folder in Cloudinary
        });

        if (!cloud_response) {
            return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        }

        // Create a new instance of the item model
        const newItem = new item({
            name,
            description,
            price,
            image: {
                public_id: cloud_response.public_id, // Use the public_id from Cloudinary response
                url: cloud_response.secure_url, // Use the secure_url from Cloudinary response
            },
        });

        // Save the item to the database
        await newItem.save();

        // Respond with the created item
        res.status(201).json({ message: "Item created successfully", item: newItem });
    } catch (error) {
        console.error("Error creating item:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateItem=async (req,res) =>{
    const { itemId } = req.params;
    const { name, description, price, image } = req.body;
    if (!req.body) {
        return res.status(400).json({ error: "Request body is missing" });
    }

    try {
        // Find and update the item
        const updatedItem = await item.findByIdAndUpdate(
            itemId,
            { name, description, price, image },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json({ message: "Item updated successfully", item: updatedItem });
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const deleteItem = async (req,res)=>{
    const {itemId} =req.params;
    try {
        const deletedItem=await item.findByIdAndDelete(itemId);
        if(!deleteItem){
            return res.status(404).json({error: "Item not found"});
        }

        res.status(201).json({message:"Item deleted successfully", item:deleteItem});
    } catch (error) {
        console.log("Error in item Deletion", error);
    }
}

const getItems = async (req, res) => {
    try {
        // Retrieve all items from the database
        const items = await item.find();

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No items found" });
        }

        res.status(200).json({ message: "Items retrieved successfully", items });
    } catch (error) {
        console.error("Error retrieving items:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const itemDetails = async (req, res) => {
    const { itemId } = req.params;

    try {
        // Find the item by ID
        const itemDetail = await item.findById(itemId);

        if (!itemDetail) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.status(200).json({ message: "Item retrieved successfully", item: itemDetail });
    } catch (error) {
        console.error("Error retrieving item details:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export {itemDetails,getItems,deleteItem,createItem,updateItem};