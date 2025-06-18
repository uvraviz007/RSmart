import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty', 'Toys', 'Health']
    },
    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

export const item = mongoose.model('item', itemSchema);