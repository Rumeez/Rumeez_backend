import mongoose, { Schema, Types, model, Model } from "mongoose";
import internal from "stream";
import { StringLiteral } from "typescript";

export interface IPreferences
{
  universityHousing: boolean;
  house: string;
  location: string;
  numOfRoommates: number;
  genderOfRoomate: string;
  budget: number;

}

const preferencesSchema = new Schema<IPreferences>({
  universityHousing: { type: Boolean, required: true },
  //email: { type: String, required: true },
 // age: {type: 3, required: true},
 // gradYear: {type: 2024, required: true}
});

export const Preferences = mongoose.model<IPreferences>('Preferences', preferencesSchema);


export interface IUser {
  name: string;
  middle?: string;
  surname: string;
  username: string;
  hashPass: string;
  gender: string;
  preferences: IPreferences;
  //email: string;
  //UID will be assigned
  //age: number;
  //gradYear: number;
}

type UserModelTyoe = Model<IUser>;



const userSchema = new Schema<IUser, UserModelTyoe>({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true },
  preferences: new Schema<IPreferences>({universityHousing: String})
  //email: { type: String, required: true },
 // age: {type: 3, required: true},
 // gradYear: {type: 2024, required: true}
});

// User model 
export const User = mongoose.model<IUser>('User', userSchema);