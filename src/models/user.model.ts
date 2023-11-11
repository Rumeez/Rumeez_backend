import mongoose, { Schema, Model } from 'mongoose';
import User from './user.interface';
import RoommatePreferences from './preferences.interface';
 
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
    verified: {
        type: Boolean,
        default: false
    },
    preferences: {
      type: new Schema<RoommatePreferences>(),
      required: false
    }
});
 
const userModel: Model<User> = mongoose.model<User>('User', userSchema);
 
export default userModel;