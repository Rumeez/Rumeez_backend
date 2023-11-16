import RoommatePreferences from "./preferences.interface";

interface User {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  telnum: string;
  gender: string;
  verified: boolean;
  usersLiked?: Array<string>;
  usersToRec?: Array<string>;
  preferences?: RoommatePreferences;
}

export default User;