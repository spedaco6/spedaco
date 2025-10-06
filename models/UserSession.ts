import mongoose, { model, models, Schema } from "mongoose";

export interface IUserSession {
    refreshToken: string,
}

const schema = new Schema({
    refreshToken: { type: String, required: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const UserSession = models.UserSession || model<IUserSession>("UserSession", schema);