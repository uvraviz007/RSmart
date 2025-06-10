import mongoose from "mongoose";

const itemSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin'
    }
})

export const item=mongoose.model('item',itemSchema);