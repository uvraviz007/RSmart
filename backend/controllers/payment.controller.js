import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Cart } from '../models/cart.model.js';
import { Purchase } from '../models/purchase.model.js';
import { item as Item } from '../models/item_model.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const cart = await Cart.findOne({ userId }).populate('items.itemId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: "Your cart is empty." });
        }

        const amount = cart.items.reduce((acc, item) => acc + item.itemId.price * item.quantity, 0) * 100; // Amount in paise

        if (amount <= 0) {
            return res.status(400).json({ error: "The total amount must be greater than zero."});
        }

        const options = {
            amount,
            currency: 'INR',
            receipt: `receipt_order_${new Date().getTime()}`,
            payment_capture: 1
        };

        const order = await razorpay.orders.create(options);
        res.status(200).json({ order });

    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Could not create order. Please try again later." });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;
        const userId = req.userId;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !shippingAddress) {
            return res.status(400).json({ error: "Missing required payment information." });
        }

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ error: "Transaction is not legitimate." });
        }

        const cart = await Cart.findOne({ userId }).populate('items.itemId');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found.' });
        }

        const purchaseItems = cart.items.map(cartItem => ({
            itemId: cartItem.itemId._id,
            quantity: cartItem.quantity,
            totalPrice: cartItem.itemId.price * cartItem.quantity,
            date: new Date(),
            shippingAddress: shippingAddress,
            userId: userId,
            paymentId: razorpay_payment_id
        }));

        await Purchase.insertMany(purchaseItems);

        for (const cartItem of cart.items) {
            await Item.findByIdAndUpdate(cartItem.itemId._id, {
                $inc: { count: -cartItem.quantity }
            });
        }

        await Cart.findOneAndDelete({ userId });

        res.status(200).json({ message: 'Payment successful and purchase recorded.' });

    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ error: 'Payment verification failed. Please contact support.' });
    }
};

export const getKey = (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
}; 