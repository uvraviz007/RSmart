import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiry: { type: Date, required: true }
});

export const Otp = mongoose.model("Otp", otpSchema); 