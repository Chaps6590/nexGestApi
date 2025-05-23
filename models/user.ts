import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, 
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  roles: {
    admin: { type: Boolean, default: false },
    user: { type: Boolean, default: false },
  },
}, {
  timestamps: true, 
});

export default mongoose.model("User", userSchema, "users");
