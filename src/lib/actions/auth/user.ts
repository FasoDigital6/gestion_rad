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
    nom?: string;
    prenom?: string;
    telephone?: string;
    poste?: string;
    adresse?: string;
    role: string;
    disabled?: boolean;
    createdAt?: string;
}