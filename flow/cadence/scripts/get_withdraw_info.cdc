import Multisign from "../Multisign.cdc"

pub fun main(treasuryAddress: Address, proposalId: UInt64): {Multisign.Action}? {
    let treasury = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                      .borrow<&Multisign.Treasury{Multisign.TreasuryPublic}>()
                      ?? panic("There does not exist a treasury here.")

    if let completedProposal = treasury.completedProposals[proposalId] {
        return completedProposal
    } else if let pendingProposal = treasury.pendingProposals[proposalId] {
        return pendingProposal
    }
    return nil
}