// 
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: Number,
    required: true,
    unique: true,
    },
    password: {
    type: String,
    required: true,
  },
  isSeller: {
    type: Boolean,
    default: false,
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'item'
  }],
  emailOtp: {
    type: String,
  },
  emailOtpExpiry: {
    type: Date,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  }
});

export const User = mongoose.model("user", userSchema);
