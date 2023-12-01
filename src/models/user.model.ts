import mongoose, { Schema, Model } from 'mongoose';
import User from './user.interface';
import RoommatePreferences from './preferences.interface';
import preferencesModel from './preferences.model';

 
const userSchema = new Schema<User>({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    telnum: {
        type: String,
        default: ""
    },
    gender: {
        type: String,
        default: ""
    },
    verified: {
        type: Boolean,
        default: false
    },
    major:{
        type: String,
        default: ""
    },
    year:{
        type: String,
        default: ""
    },
    bio:{
        type: String,
        default: ""
    },
    usersLiked: {
        type: [String],
        default: []
    },
    usersSkipped:{
        type: [String],
        default: []
    },
   
    preferences: {
       
      type: preferencesModel.schema,
      required: false
    },
    chats: {
        type: [String],
        default: []
    }
});
 
const userModel: Model<User> = mongoose.model<User>('User', userSchema);
 
export default userModel;