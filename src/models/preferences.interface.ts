import { Document } from 'mongoose';

interface RoommatePreferences {
  dormType: string;
  numberOfRoommates: number;
  genderOfRoomate: string;
  smoking: boolean;
  drinking: boolean;
  riseTime: string;
  sleepTime: string;
  temp: string;
}

export interface RoommatePreferencesDocument extends RoommatePreferences, Document {}

export default RoommatePreferences;