import Multisign from "../Multisign.cdc"
import FlowToken from "../utility/FlowToken.cdc"

transaction(
  treasuryAddress: Address,
  amount: UFix64,
  description: String
) {

    let Treasury: &Multisign.Treasury{Multisign.TreasuryPublic}
    let FlowVault: @FlowToken.Vault
    let Donor: Address

    prepare(signer: AuthAccount) {
       if signer.borrow<&Multisign.Treasury>(from: Multisign.TreasuryStoragePath) == nil {
            signer.save(<- Multisign.createTreasury(admins: [signer.address]), to: Multisign.TreasuryStoragePath)
            signer.link<&Multisign.Treasury{Multisign.TreasuryPublic}>(Multisign.TreasuryPublicPath, target: Multisign.TreasuryStoragePath)
       }

      self.Treasury = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                      .borrow<&Multisign.Treasury{Multisign.TreasuryPublic}>()
                      ?? panic("There does not exist a treasury here.")

      let flowVaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)!
      self.FlowVault <- flowVaultRef.withdraw(amount: amount) as! @FlowToken.Vault
      
      self.Donor = signer.address
    }

    execute {
      self.Treasury.deposit(
        flowVault: <- self.FlowVault,
        description: description,
        donor: self.Donor
      )
    }
}
 