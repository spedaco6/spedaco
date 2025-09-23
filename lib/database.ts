import mongoose from "mongoose";


let dbConnection: typeof mongoose | null = null;

export async function connectToDB() {
  const MONGO_URI = process.env.NODE_ENV === "development" ? process.env.DB_URI_DEV : process.env.DB_URI;
  
  if (!MONGO_URI) {
    // if (process.env.NODE_ENV === "test") return null;
    throw new Error("Missing DB_URI_DEV in environment variables");
  }
  
  if (dbConnection) return dbConnection;
  
  try {
    dbConnection = await mongoose.connect(MONGO_URI!);
    console.log("MongoDB connected");
    return dbConnection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return null;
  }
}

// Event listeners for other connection related events
mongoose.connection.on("error", (err) => {
  console.error("Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected");
});
