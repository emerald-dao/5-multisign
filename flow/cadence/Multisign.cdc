import FlowToken from "./utility/FlowToken.cdc"
import FungibleToken from "./utility/FungibleToken.cdc"

pub contract Multisign {

  pub var totalActions: UInt64

  // Paths
  pub let TreasuryStoragePath: StoragePath
  pub let TreasuryPublicPath: PublicPath

  pub struct PendingProposal {
    pub let id: UInt64
    pub let amount: Fix64
    pub let description: String
    pub let timeProposed: UFix64
    pub let proposedBy: Address
    pub let transferTo: Address

    pub let signers: [Address]

    access(contract) fun sign(by: Address) {
      pre {
        !self.signers.contains(by): "This person has already signed this proposal."
      }
      self.signers.append(by)
    }

    init(id: UInt64,  amount: Fix64, description: String, proposedBy: Address, transferTo: Address) {
      self.id = id
      self.amount = amount
      self.description = description
      self.timeProposed = getCurrentBlock().timestamp
      self.proposedBy = proposedBy
      self.transferTo = transferTo

      self.signers = []
    }
  }

  pub struct CompletedProposal {
    pub let id: UInt64
    pub let amount: Fix64
    pub let description: String
    pub let timeProposed: UFix64
    pub let proposedBy: Address
    pub let transferTo: Address

    pub let timeAccepted: UFix64

    init(id: UInt64, amount: Fix64, description: String, timeProposed: UFix64, proposedBy: Address, transferTo: Address, timeAccepted: UFix64) {
      self.id = id
      self.amount = amount
      self.description = description
      self.timeProposed = timeProposed
      self.proposedBy = proposedBy
      self.transferTo = transferTo

      self.timeAccepted = timeAccepted
    }
  }

  pub struct Deposit {
    pub let amount: UFix64
    pub let description: String
    pub let donor: Address

    init(amount: UFix64, description: String, donor: Address) {
      self.amount = amount
      self.description = description
      self.donor = donor
    }
  }

  pub resource interface TreasuryPublic {
    pub let admins: [Address]
    pub let pendingProposals: {UInt64: PendingProposal}
    pub let completedProposals: {UInt64: CompletedProposal}
    access(contract) fun createProposal(amount: Fix64, description: String, proposedBy: Address, transferTo: Address)
    pub fun deposit(flowVault: @FlowToken.Vault, description: String, donor: Address)
    access(contract) fun getPendingProposalRef(proposalId: UInt64): &PendingProposal?
    pub fun getPendingProposal(proposalId: UInt64): PendingProposal?
    pub fun getCompletedProposal(proposalId: UInt64): CompletedProposal?
    pub fun getTreasuryBalance(): UFix64
  }

  pub resource Treasury: TreasuryPublic {
    pub let admins: [Address]
    pub let flowVault: @FlowToken.Vault
    pub let pendingProposals: {UInt64: PendingProposal}
    pub let completedProposals: {UInt64: CompletedProposal}
    pub let deposits: {UInt64: Deposit}
    pub let orderedActions: [UInt64]

    pub fun proposeProposal(
      treasuryAddress: Address, 
      proposalId: UInt64, 
      amount: Fix64, 
      description: String,
      transferTo: Address
    ) {
      let treasuryPublic = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                          .borrow<&Treasury{TreasuryPublic}>() ?? panic("There does not exist a Treasury here.")
      treasuryPublic.createProposal(amount: amount, description: description, proposedBy: self.owner!.address, transferTo: transferTo)
    }

    access(contract) fun createProposal(amount: Fix64, description: String, proposedBy: Address, transferTo: Address) {
      self.pendingProposals[Multisign.totalActions] = PendingProposal(
        id: Multisign.totalActions,
        amount: amount, 
        description: description, 
        proposedBy: proposedBy,
        transferTo: transferTo
      )

      Multisign.totalActions = Multisign.totalActions + 1
    }

    pub fun deposit(flowVault: @FlowToken.Vault, description: String, donor: Address) {
      self.deposits[Multisign.totalActions] = Deposit(
        amount: flowVault.balance,
        description: description,
        donor: donor
      )

      self.flowVault.deposit(from: <- flowVault)
    }

    pub fun signProposal(treasuryAddress: Address, proposalId: UInt64) {
      let treasuryPublic = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                          .borrow<&Treasury{TreasuryPublic}>() ?? panic("There does not exist a Treasury here.")

      assert(treasuryPublic.admins.contains(self.owner!.address), message: "You are not an admin of the given treasury.")

      let pendingProposalRef = treasuryPublic.getPendingProposalRef(proposalId: proposalId) 
                        ?? panic("This proposal does not exist.")
      pendingProposalRef.sign(by: self.owner!.address)

      if pendingProposalRef.signers.length == self.admins.length {
        // Complete the action
        self.completeAction(proposalId: proposalId)
      }
    }

    access(self) fun completeAction(proposalId: UInt64) {
      let proposal = self.pendingProposals.remove(key: proposalId)!
      self.completedProposals[proposal.id] = CompletedProposal(
        id: proposal.id, 
        amount: proposal.amount, 
        description: proposal.description, 
        timeProposed: proposal.timeProposed, 
        proposedBy: proposal.proposedBy, 
        transferTo: proposal.transferTo,
        timeAccepted: getCurrentBlock().timestamp
      )
      let receiverFlowVault = getAccount(proposal.transferTo).getCapability(/public/flowTokenReceiver)
                        .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()!
      receiverFlowVault.deposit(from: <- self.flowVault.withdraw(amount: proposal.amount))
    }

    access(contract) fun getPendingProposalRef(proposalId: UInt64): &PendingProposal? {
      return &self.pendingProposals[proposalId] as &PendingProposal?
    }

    pub fun getPendingProposal(proposalId: UInt64): PendingProposal? {
      return self.pendingProposals[proposalId]
    }

    pub fun getCompletedProposal(proposalId: UInt64): CompletedProposal? {
      return self.completedProposals[proposalId]
    }

    pub fun getTreasuryBalance(): UFix64 {
      return self.flowVault.balance
    }

    init(admins: [Address]) {
      self.admins = admins
      self.flowVault <- FlowToken.createEmptyVault() as! @FlowToken.Vault
      self.pendingProposals = {}
      self.completedProposals = {}
      self.deposits = {}
      self.orderedActions = []
    }

    destroy() {
      pre {
        self.flowVault.balance == 0.0: "Please withdraw all funds before destroying your Treasury."
      }

      destroy self.flowVault
    }
  }

  init() {
    self.totalProposals = 0
    self.TreasuryStoragePath = /storage/EmeraldAcademyMultisignTreasury
    self.TreasuryPublicPath = /public/EmeraldAcademyMultisignTreasury
  }

}