import RoommatePreferences from "./preferences.interface";

interface User {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  telnum: string;
  verified: boolean;
  preferences?: RoommatePreferences;
}

export default User;