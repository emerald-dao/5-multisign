import * as fcl from "@onflow/fcl";
import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {

  const [user, setUser] = useState({
    loggedIn: false,
    addr: undefined,
  });
  const [balance, setBalance] = useState();

  useEffect(() => {
    if (!user.loggedIn) {
      setBalance(null);
    } else {
      getBalance();
    }
  }, [user]);

  useEffect(() => fcl.currentUser.subscribe(setUser), []);

  async function getBalance() {
    const response = await fcl.query({
      cadence: `
        import FungibleToken from 0xStandard
        import FlowToken from 0xFlowToken
        
        pub fun main(account: Address): UFix64? {
            let vaultRef = getAccount(account).getCapability(/public/flowTokenBalance)
                            .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
            return vaultRef?.balance
        }
        `,
      args: (arg, t) => [arg(user.addr, t.Address)]
    });

    setBalance(response);
  }

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
    balance,
    getBalance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}