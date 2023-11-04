import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  name: string;
  surname?: string;
  username: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  surname: String,
  username: { type: String, required: true }
});

// User model 
export const User = mongoose.model<IUser>('User', userSchema);