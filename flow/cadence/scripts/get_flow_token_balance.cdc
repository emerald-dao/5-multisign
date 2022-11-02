import FungibleToken from "../utility/FungibleToken.cdc"
import FlowToken from "../utility/FlowToken.cdc"

pub fun main(account: Address): UFix64? {
    let vaultRef = getAccount(account).getCapability(/public/flowTokenBalance)
                    .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
    return vaultRef?.balance
}