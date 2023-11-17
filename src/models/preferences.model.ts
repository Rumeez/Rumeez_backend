import mongoose, { Schema, Model } from 'mongoose';
import RoommatePreferences, { RoommatePreferencesDocument } from './preferences.interface';

const preferencesSchema = new Schema<RoommatePreferencesDocument>({
  dormType: { type: String },
  numberOfRoommates: { type: Number },
  genderOfRoomate: { type: String },
  smoking: { type: Boolean },
  drinking: { type: Boolean },
  riseTime: { type: String },
  sleepTime: { type: String },
  temp: { type: String },
});

const preferencesModel: Model<RoommatePreferencesDocument> = mongoose.model<RoommatePreferencesDocument>('RoommatePreferences', preferencesSchema);

export default preferencesModel;