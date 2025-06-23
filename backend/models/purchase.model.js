import mongoose from "mongoose";
import { date } from "zod";

const purchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'item',
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    totalPrice: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentId: {
        type: String,
        required: true
    }
});

export const Purchase = mongoose.model('purchase', purchaseSchema);