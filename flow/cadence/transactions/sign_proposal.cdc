import Multisign from "../Multisign.cdc"

transaction(
  treasuryAddress: Address, 
  proposalId: UInt64
) {

    let MyTreasury: &Multisign.Treasury

    prepare(signer: AuthAccount) {
       if signer.borrow<&Multisign.Treasury>(from: Multisign.TreasuryStoragePath) == nil {
            signer.save(<- Multisign.createTreasury(admins: [signer.address]), to: Multisign.TreasuryStoragePath)
            signer.link<&Multisign.Treasury{Multisign.TreasuryPublic}>(Multisign.TreasuryPublicPath, target: Multisign.TreasuryStoragePath)
       }

       self.MyTreasury = signer.borrow<&Multisign.Treasury>(from: Multisign.TreasuryStoragePath)!
    }

    execute {
      self.MyTreasury.signProposal(
        treasuryAddress: treasuryAddress, 
        proposalId: proposalId
      )
    }
}
 