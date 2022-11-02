import Multisign from "../Multisign.cdc"

pub fun main(treasuryAddress: Address, proposalId: UInt64): Multisign.CompletedProposal? {
    let treasury = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                      .borrow<&Multisign.Treasury{Multisign.TreasuryPublic}>()
                      ?? panic("There does not exist a treasury here.")

    return treasury.completedProposals[proposalId]
}