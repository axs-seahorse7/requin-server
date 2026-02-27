import mongoose from "mongoose";

let isConnected = false;

 const connectDB = async () => {
  if (isConnected) return;
  const db = await mongoose.connect(process.env.MONGODB_URI);
  isConnected = db.connections[0].readyState;
};

export default connectDB;