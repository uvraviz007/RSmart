import path from 'path'; // Import path module for file extension handling
import { item } from "../models/item_model.js"; // Ensure the item model is imported correctly
import { v2 as cloudinary } from 'cloudinary';
import { Purchase } from "../models/purchase.model.js"; // Import the Purchase model for handling purchases

const createItem = async (req, res) => {
    const sellerId = req.sellerId;
    const { name, description, price, category } = req.body;
    try {
        // Validate input
        if (!name || !description || !price || !category) {
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
            category,
            image: {
                public_id: cloud_response.public_id, // Use the public_id from Cloudinary response
                url: cloud_response.secure_url, // Use the secure_url from Cloudinary response
            },
            creatorId: sellerId
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

const updateItem = async (req, res) => {
    const { itemId } = req.params; // Use req.params for itemId
    const sellerId = req.sellerId; // Ensure sellerId is present (adjust as per your middleware)
    const { name, description, price, category } = req.body;

    // console.log("Update Item Request Body:", sellerId, itemId); // Debugging line
    if (!itemId || !sellerId) {
        return res.status(400).json({ error: "itemId and sellerId are required" });
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = price;
    if (category !== undefined) updateFields.category = category;

    try {
        const updatedItem = await item.findOneAndUpdate(
            {_id: itemId, creatorId: sellerId}, // Ensure the item belongs to the seller
            updateFields,
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
    const sellerId = req.sellerId; // Ensure sellerId is present (adjust as per your middleware)
    try {
        const deletedItem=await item.findOneAndDelete({_id:itemId, creatorId: sellerId});
        if(!deletedItem){
            return res.status(404).json({error: "Item not found"});
        }

        res.status(201).json({message:"Item deleted successfully", item:deletedItem});
    } catch (error) {
        console.log("Error in item Deletion", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const getItems = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;
        let query = {};

        // Add category filter
        if (category) {
            query.category = category;
        }

        // Add price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const items = await item.find(query);

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No items found" });
        }

        res.status(200).json({ message: "Items retrieved successfully", items });
    } catch (error) {
        console.error("Error retrieving items:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getItemsOfSeller= async (req, res) => {    
    
    const sellerId = req.sellerId; // Ensure sellerId is present (adjust as per your middleware)
    try {
        // Retrieve all items created by the seller
        const items = await item.find({ creatorId: sellerId });

        if (!items || items.length === 0) {
            return res.status(404).json({ error: "No items found for this seller" });
        }

        res.status(200).json({ message: "Items retrieved successfully", items });
    } catch (error) {
        console.error("Error retrieving seller's items:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}   

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

const buyItem = async (req, res) => {
    // console.log("Buying item...");
    const { itemId } = req.params;
    const {count}= req.body;
    try {
        // Find the item by ID
        const itemToBuy = await item.findById(itemId);  
        if (!itemToBuy) {
            return res.status(404).json({ error: "Item not found" });
        }      

        const purchaseCount = count || 1;
        const totalPrice = itemToBuy.price * purchaseCount;

        const newPurchase = new Purchase({
            userId: req.userId, // Assuming user ID is stored in req.user
            itemId: itemToBuy._id,
            count: purchaseCount,
            totalPrice// Default to 1 if count is not provided
        });

        await newPurchase.save();
        
        res.status(200).json({ message: "Item purchased successfully", item: itemToBuy });
    } catch (error) {
        console.error("Error buying item:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
    
};  

const getCategories = async (req, res) => {
    try {
        // Get unique categories from items
        const categories = await item.distinct('category');
        res.status(200).json({ categories });
    } catch (error) {
        console.error("Error retrieving categories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export {getItemsOfSeller,buyItem,itemDetails,getItems,deleteItem,createItem,updateItem,getCategories};