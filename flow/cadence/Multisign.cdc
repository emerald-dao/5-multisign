import FlowToken from "./utility/FlowToken.cdc"
import FungibleToken from "./utility/FungibleToken.cdc"

pub contract Multisign {

  pub var totalActions: UInt64

  // Paths
  pub let TreasuryStoragePath: StoragePath
  pub let TreasuryPublicPath: PublicPath

  pub struct interface Action {
    pub let id: UInt64
    pub let type: String
    pub let amount: UFix64
    pub let description: String
    pub let proposedBy: Address
  }

  pub struct PendingProposal: Action {
    pub let id: UInt64
    pub let type: String
    pub let amount: UFix64
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

    init(id: UInt64,  amount: UFix64, description: String, proposedBy: Address, transferTo: Address) {
      self.id = id
      self.type = "Pending"
      self.amount = amount
      self.description = description
      self.timeProposed = getCurrentBlock().timestamp
      self.proposedBy = proposedBy
      self.transferTo = transferTo
      self.signers = []
    }
  }

  pub struct CompletedProposal: Action {
    pub let id: UInt64
    pub let type: String
    pub let amount: UFix64
    pub let description: String
    pub let timeProposed: UFix64
    pub let proposedBy: Address
    pub let transferTo: Address
    pub let signers: [Address]

    pub let timeAccepted: UFix64

    init(id: UInt64, amount: UFix64, description: String, timeProposed: UFix64, proposedBy: Address, transferTo: Address, signers: [Address], timeAccepted: UFix64) {
      self.id = id
      self.type = "Completed"
      self.amount = amount
      self.description = description
      self.timeProposed = timeProposed
      self.proposedBy = proposedBy
      self.transferTo = transferTo
      self.signers = signers

      self.timeAccepted = timeAccepted
    }
  }

  pub struct Deposit: Action {
    pub let id: UInt64
    pub let type: String
    pub let amount: UFix64
    pub let description: String
    pub let proposedBy: Address

    init(id: UInt64, amount: UFix64, description: String, donor: Address) {
      self.id = id
      self.type = "Deposit"
      self.amount = amount
      self.description = description
      self.proposedBy = donor
    }
  }

  pub resource interface TreasuryPublic {
    pub let admins: [Address]
    pub let pendingProposals: {UInt64: PendingProposal}
    pub let completedProposals: {UInt64: CompletedProposal}
    pub let deposits: {UInt64: Deposit}
    pub let orderedActions: [{Action}]
    access(contract) fun createProposal(amount: UFix64, description: String, proposedBy: Address, transferTo: Address)
    access(contract) fun completeAction(proposalId: UInt64)
    pub fun deposit(flowVault: @FlowToken.Vault, description: String, donor: Address)
    access(contract) fun getPendingProposalRef(proposalId: UInt64): &PendingProposal?
    pub fun getTreasuryBalance(): UFix64
  }

  pub resource Treasury: TreasuryPublic {
    pub let admins: [Address]
    pub let flowVault: @FlowToken.Vault
    pub let pendingProposals: {UInt64: PendingProposal}
    pub let completedProposals: {UInt64: CompletedProposal}
    pub let deposits: {UInt64: Deposit}
    pub let orderedActions: [{Action}]

    pub fun proposeProposal(
      treasuryAddress: Address, 
      amount: UFix64, 
      description: String,
      transferTo: Address
    ) {
      let treasuryPublic = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                          .borrow<&Treasury{TreasuryPublic}>() ?? panic("There does not exist a Treasury here.")
      treasuryPublic.createProposal(amount: amount, description: description, proposedBy: self.owner!.address, transferTo: transferTo)
    }

    access(contract) fun createProposal(amount: UFix64, description: String, proposedBy: Address, transferTo: Address) {
      let proposal = PendingProposal(
        id: Multisign.totalActions,
        amount: amount, 
        description: description, 
        proposedBy: proposedBy,
        transferTo: transferTo
      )

      self.pendingProposals[Multisign.totalActions] = proposal
      self.orderedActions.append(proposal)

      Multisign.totalActions = Multisign.totalActions + 1
    }

    pub fun deposit(flowVault: @FlowToken.Vault, description: String, donor: Address) {
      let deposit = Deposit(
        id: Multisign.totalActions, 
        amount: flowVault.balance,
        description: description,
        donor: donor
      )
      
      self.deposits[Multisign.totalActions] = deposit
      self.orderedActions.append(deposit)

      self.flowVault.deposit(from: <- flowVault)
      Multisign.totalActions = Multisign.totalActions + 1
    }

    pub fun signProposal(treasuryAddress: Address, proposalId: UInt64) {
      let treasuryPublic = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                          .borrow<&Treasury{TreasuryPublic}>() ?? panic("There does not exist a Treasury here.")

      assert(treasuryPublic.admins.contains(self.owner!.address), message: "You are not an admin of the given treasury.")

      let pendingProposalRef = treasuryPublic.getPendingProposalRef(proposalId: proposalId) 
                        ?? panic("This proposal does not exist.")
      pendingProposalRef.sign(by: self.owner!.address)

      if pendingProposalRef.signers.length == treasuryPublic.admins.length {
        // Complete the action
        treasuryPublic.completeAction(proposalId: proposalId)
      }
    }

    access(contract) fun completeAction(proposalId: UInt64) {
      let proposal = self.pendingProposals.remove(key: proposalId)!
      let completedProposal = CompletedProposal(
        id: proposal.id, 
        amount: proposal.amount, 
        description: proposal.description, 
        timeProposed: proposal.timeProposed, 
        proposedBy: proposal.proposedBy, 
        transferTo: proposal.transferTo,
        signers: proposal.signers,
        timeAccepted: getCurrentBlock().timestamp
      )
      self.completedProposals[proposal.id] = completedProposal
      self.orderedActions.append(completedProposal)

      let receiverFlowVault = getAccount(proposal.transferTo).getCapability(/public/flowTokenReceiver)
                        .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()!
      receiverFlowVault.deposit(from: <- self.flowVault.withdraw(amount: proposal.amount))
    }

    pub fun addSigner(admin: Address) {
      pre {
        !self.admins.contains(admin): "This is already an Admin of the treasury."
      }
      self.admins.append(admin)
    }

    access(contract) fun getPendingProposalRef(proposalId: UInt64): &PendingProposal? {
      return &self.pendingProposals[proposalId] as &PendingProposal?
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

  pub fun createTreasury(admins: [Address]): @Treasury {
    return <- create Treasury(admins: admins)
  }

  init() {
    self.totalActions = 0
    self.TreasuryStoragePath = /storage/EmeraldAcademyMultisignTreasury
    self.TreasuryPublicPath = /public/EmeraldAcademyMultisignTreasury

    self.account.save(<- Multisign.createTreasury(admins: [self.account.address]), to: Multisign.TreasuryStoragePath)
    self.account.link<&Multisign.Treasury{Multisign.TreasuryPublic}>(Multisign.TreasuryPublicPath, target: Multisign.TreasuryStoragePath)
  }

}