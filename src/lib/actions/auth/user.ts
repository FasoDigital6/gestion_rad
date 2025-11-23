import { UserInfo } from "firebase/auth";



export interface User extends UserInfo {
    idToken: string;
    customToken: string;
    role: string;
}

export interface userData {
    id: string;
    email: string;
    name: string;
    role: string;
}