const fcl = require("@onflow/fcl");
const { serverAuthorization } = require("./auth/authorization.js");
require("../flow/config.js");

async function signRequest(proposalId) {

  try {
    const transactionId = await fcl.mutate({
      cadence: `
      import Multisign from 0xDeployer

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
      `,
      args: (arg, t) => [
        arg(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, t.Address),
        arg(proposalId, t.UInt64)
      ],
      proposer: serverAuthorization,
      payer: serverAuthorization,
      authorizations: [serverAuthorization],
      limit: 999
    });

    console.log('Transaction Id', transactionId);
  } catch (e) {
    console.log(e);
  }
}

signRequest(process.argv.slice(2)[0]);