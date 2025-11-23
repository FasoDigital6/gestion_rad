"use client";

import * as React from "react";
import { createContext, useContext } from "react";
import { User } from "../../actions/auth/user";

export interface AuthProviderProps {
  user: User | null;
  children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  user,
  children,
}) => {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const AuthContext = createContext<User | null>(null);

export const useAuth = () => useContext(AuthContext);
