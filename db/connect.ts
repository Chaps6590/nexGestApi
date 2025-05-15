import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function connectDB() {
    console.log("Connecting to MongoDB...", process.env.MONGO_URL)
    
    if (!process.env.MONGO_URL) {
        throw new Error("Please define the MONGODB_URI environment variable inside .env.local");    
    }

    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB connected successfully")
    }
    catch (error) {
        console.error("MongoDB connection error:", error);     
    }

}

export default connectDB;