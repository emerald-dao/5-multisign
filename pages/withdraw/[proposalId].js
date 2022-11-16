import * as fcl from "@onflow/fcl";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";

export default function WithdrawInfo() {
  const { user, getBalance } = useAuth();
  const router = useRouter();
  const { proposalId } = router.query;
  const [withdrawInfo, setWithdrawInfo] = useState({});
  const [processing, setProcessing] = useState(false);
  const [treasuryInfo, setTreasuryInfo] = useState({});

  useEffect(() => {
    getTreasuryInfo();
  }, []);

  useEffect(() => {
    if (proposalId) {
      getWithdrawInfo();
    }
  }, [proposalId])

  async function getWithdrawInfo() {
    const result = await fcl.query({
      cadence: `
      import Multisign from 0xDeployer

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
      `,
      args: (arg, t) => [
        arg(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, t.Address),
        arg(proposalId, t.UInt64)
      ]
    });

    console.log(result);

    setWithdrawInfo(result);
  }

  async function getTreasuryInfo() {
    const result = await fcl.query({
      cadence: `
      import Multisign from 0xDeployer

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
      `,
      args: (arg, t) => [arg(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, t.Address)]
    });

    console.log(result);

    setTreasuryInfo(result);
  }

  async function signProposal() {
    setProcessing(true);
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
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    });

    await fcl.tx(transactionId).onceSealed();
    setProcessing(false);
    getWithdrawInfo();
    getBalance();
  }

  if (withdrawInfo.id && treasuryInfo.balance) {
    return (
      <div className='flex justify-center pt-20 '>
        <div className='w-[70%] space-y-10 flex justify-center'>
          <div className='bg-[#00344B] md:w-[70%] p-5 rounded-lg'>
            <div className='flex justify-between items-center'>
              <div>
                <h1 className='text-gray-200 text-xl font-bold'>{withdrawInfo.type === 'Pending' ? 'Pending' : 'Completed'}</h1>
              </div>
              <div className='text-gray-400 text-sm font-semibold pr-2'>
                <p className='text-gray-300 opacity-75'>Request by: {withdrawInfo.proposedBy}</p>
              </div>
            </div>
            <div className="space-y-2 pt-7">
              <h1 className="text-gray-300 pl-1">Signed By:</h1>
              <div className="rounded-xl  px-3 py-4 text-white bg-[#031523] flex space-x-4 text-xs">
                {withdrawInfo.signers.map(signer => (
                  <p key={signer} className="text-[#38E8C6] border max-w-max px-2 rounded-full border-[#38E8C6]">{signer}</p>
                ))}
              </div>
            </div>
            <div className='flex items-center pt-8 space-x-3'>
              <p className='text-gray-300'>Amount requested:</p>
              <p className='text-[#2bbc9f]'>{parseFloat(withdrawInfo.amount).toFixed(3)} FLOW</p>
            </div>
            <div className='flex items-center pt-8 space-x-3'>
              <p className='text-gray-300'>Beneficiary:</p>
              <p className='text-[#2bbc9f]'>{withdrawInfo.transferTo}</p>
            </div>
            <div className='pt-8 space-y-3'>
              <p className='text-gray-300'>Description:</p>
              <p className='text-gray-400'>{withdrawInfo.description}</p>
            </div>

            {withdrawInfo.type === 'Pending' && treasuryInfo.admins.includes(user.addr) && !withdrawInfo.signers.includes(user.addr) ?
              <div className='space-x-3 pt-7 flex'>
                <button className='rounded-lg w-full py-2 bg-[#2bbc9f] text-white' onClick={signProposal}>{processing ? 'Signing Request...' : 'Sign Request'}</button>
              </div>
              : withdrawInfo.type === 'Pending' && !treasuryInfo.admins.includes(user.addr) ?
                <div className='space-x-3 pt-7 flex'>
                  <button className='disabled rounded-lg w-full py-2 bg-[red] text-white'>You are not an admin of this treasury.</button>
                </div>
                : null}

            {withdrawInfo.signers.includes(user.addr) ?
              <div className='border mt-10 rounded-lg px-6 py-2 text-[#2bbc9f] border-[#2bbc9f] text-center'>You Signed This Request</div>
              : null}
          </div>
        </div>
      </div>
    )
  }
}