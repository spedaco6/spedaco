import { Schema, Document, model, models } from "mongoose";

export type UserRole = "user" | "client" | "manager" | "admin" | "super"; 
export interface IUser extends Document {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  verified: boolean,
  role: UserRole, 
  terms: boolean,
}

const schema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, required: true, default: false },
  role: { 
    type: String, 
    required: true, 
    default: "user", 
    enum: ["user", "client", "manager", "admin", "super"] 
  },
  terms: { type: Boolean, required: true },
}, { timestamps: true });

export const User = models.User || model<IUser>("User", schema);