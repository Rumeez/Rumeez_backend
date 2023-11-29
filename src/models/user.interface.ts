import RoommatePreferences from "./preferences.interface";
import mongoose from "mongoose";
import {ObjectId}  from 'mongodb';

interface User extends mongoose.Document {
  _id: ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  telnum: string;
  gender: string;
  verified: boolean;
  usersLiked?: Array<string>;
  usersSkipped?: Array<string>;
  preferences?: RoommatePreferences;
}

export default User;