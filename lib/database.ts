import mongoose from "mongoose";

const MONGO_URI = process.env.DB_URI_DEV;
console.log(MONGO_URI);

if (!MONGO_URI) {
  throw new Error("Missing DB_URI_DEV in environment variables");
}

let dbConnection: typeof mongoose | null = null;

export async function connectToDB() {
  if (dbConnection) return dbConnection;
  try {
    dbConnection = await mongoose.connect(MONGO_URI!);
    console.log("MongoDB connected");
    return dbConnection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

// Optional: Event listeners for debugging (only set up once)
mongoose.connection.on("error", (err) => {
  console.error("Mongoose error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected");
});
