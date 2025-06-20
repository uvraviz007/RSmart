import { Cart } from "../models/cart.model.js";
import { item as Item } from "../models/item_model.js";
import { Purchase } from '../models/purchase.model.js';

// Get user's cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.userId }).populate('items.itemId');
        if (!cart) {
            // If no cart, create one
            const newCart = new Cart({ userId: req.userId, items: [] });
            await newCart.save();
            return res.status(200).json({ cart: newCart });
        }
        res.status(200).json({ cart });
    } catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Add item to cart
export const addToCart = async (req, res) => {
    const { itemId, quantity } = req.body;
    const userId = req.userId;

    try {
        const itemToAdd = await Item.findById(itemId);
        if (!itemToAdd) {
            return res.status(404).json({ error: "Item not found" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(p => p.itemId.toString() === itemId);
        
        let newQuantity = quantity;
        if (itemIndex > -1) {
            newQuantity += cart.items[itemIndex].quantity;
        }

        if (itemToAdd.count < newQuantity) {
            return res.status(400).json({ 
                error: `Only ${itemToAdd.count} items remaining in stock. You already have ${cart.items[itemIndex]?.quantity || 0} in your cart.`,
                availableStock: itemToAdd.count
            });
        }

        if (itemIndex > -1) {
            // Item exists, update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({ itemId, quantity });
        }

        await cart.save();
        const populatedCart = await cart.populate('items.itemId');
        res.status(200).json({ message: "Item added to cart", cart: populatedCart });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    const { itemId } = req.params;
    const userId = req.userId;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        cart.items = cart.items.filter(p => p.itemId.toString() !== itemId);

        await cart.save();
        const populatedCart = await cart.populate('items.itemId');
        res.status(200).json({ message: "Item removed from cart", cart: populatedCart });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Update item quantity in cart
export const updateItemQuantity = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.userId;

    try {
        if (quantity <= 0) {
            return removeFromCart(req, res);
        }

        const itemToUpdate = await Item.findById(itemId);
        if (!itemToUpdate) {
            return res.status(404).json({ error: "Item not found" });
        }

        if (itemToUpdate.count < quantity) {
            return res.status(400).json({ 
                error: `Only ${itemToUpdate.count} items remaining in stock. You cannot add more.`,
                availableStock: itemToUpdate.count
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(p => p.itemId.toString() === itemId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            return res.status(404).json({ error: "Item not in cart" });
        }
        
        await cart.save();
        const populatedCart = await cart.populate('items.itemId');
        res.status(200).json({ message: "Cart updated", cart: populatedCart });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const checkoutFromCart = async (req, res) => {
    const userId = req.userId;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
        return res.status(400).json({ error: "Shipping address is required." });
    }

    try {
        const cart = await Cart.findOne({ userId }).populate('items.itemId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Your cart is empty." });
        }

        const insufficientStockItems = [];
        
        // --- Validation Phase ---
        for (const cartItem of cart.items) {
            const item = cartItem.itemId;
            if (item.count < cartItem.quantity) {
                insufficientStockItems.push({
                    itemId: item._id,
                    name: item.name,
                    requested: cartItem.quantity,
                    available: item.count,
                });
            }
        }

        if (insufficientStockItems.length > 0) {
            return res.status(400).json({
                error: "Insufficient stock for some items. Please adjust your cart.",
                details: insufficientStockItems,
            });
        }

        // --- Execution Phase ---
        const purchases = [];
        const itemUpdateOperations = [];

        for (const cartItem of cart.items) {
            const item = cartItem.itemId;
            const totalPrice = item.price * cartItem.quantity;

            // Prepare purchase document
            purchases.push({
                userId,
                itemId: item._id,
                count: cartItem.quantity,
                totalPrice,
                shippingAddress,
            });
            
            // Prepare item stock update operation
            itemUpdateOperations.push({
                updateOne: {
                    filter: { _id: item._id },
                    update: { $inc: { count: -cartItem.quantity } }
                }
            });
        }

        // Execute DB operations
        await Purchase.insertMany(purchases);
        await Item.bulkWrite(itemUpdateOperations);

        // Clear the cart
        cart.items = [];
        await cart.save();

        res.status(200).json({ message: "Checkout successful! Items have been purchased." });

    } catch (error) {
        console.error("Error during checkout:", error);
        res.status(500).json({ error: "An error occurred during checkout. Please try again." });
    }
}; 