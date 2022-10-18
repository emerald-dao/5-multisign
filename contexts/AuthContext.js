import * as fcl from "@onflow/fcl";
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {

    const [user, setUser] = useState({
      loggedIn: false,
      addr: undefined,
    });

    useEffect(() => fcl.currentUser.subscribe(setUser), []);
  
    const logOut = async () => {
      fcl.unauthenticate();
      setUser({ loggedIn: false, addr: undefined });
    };

    const logIn = () => {
      fcl.logIn();
    };
  
    const value = {
      user,
      logOut,
      logIn,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }