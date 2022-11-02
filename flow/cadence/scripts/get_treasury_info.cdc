import Multisign from "../Multisign.cdc"

pub fun main(treasuryAddress: Address): Info {
    let treasury = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                      .borrow<&Multisign.Treasury{Multisign.TreasuryPublic}>()
                      ?? panic("There does not exist a treasury here.")

    return Info(treasury.admins, treasury.getTreasuryBalance(), treasury.pendingProposals, treasury.completedProposals, treasury.deposits, treasury.orderedActions)
}

pub struct Info {
  pub let admins: [Address]
  pub let balance: UFix64
  pub let pendingProposals: {UInt64: Multisign.PendingProposal}
  pub let completedProposals: {UInt64: Multisign.CompletedProposal}
  pub let deposits: {UInt64: Multisign.Deposit}
  pub let orderedActions: [{Multisign.Action}]

  init(
    _ admins: [Address],
    _ balance: UFix64,
    _ pendingProposals: {UInt64: Multisign.PendingProposal},
    _ completedProposals: {UInt64: Multisign.CompletedProposal},
    _ deposits: {UInt64: Multisign.Deposit},
    _ orderedActions: [{Multisign.Action}]
  ) {
    self.admins = admins
    self.balance = balance
    self.pendingProposals = pendingProposals
    self.completedProposals = completedProposals
    self.deposits = deposits
    self.orderedActions = orderedActions
  }
}