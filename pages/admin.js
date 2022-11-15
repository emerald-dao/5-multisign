import * as fcl from "@onflow/fcl";
import Link from "next/link";
import { useState, useEffect } from 'react';
import AddAdminModal from "../components/AddAdmin";

export default function Admin() {
  const [treasuryInfo, setTreasuryInfo] = useState({});

  useEffect(() => {
    getTreasuryInfo();
  }, []);

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
      args: (arg, t) => [arg('0xf8d6e0586b0a20c7', t.Address)]
    });

    console.log(result);

    setTreasuryInfo(result);
  }

  if (treasuryInfo.balance) {
    return (
      <div className='flex justify-center pt-16 '>
        <div className='w-[70%] space-y-10'>
          <div className="space-y-2 pb-3">
            <div className="flex justify-between items-center pb-2">
              <h1 className="text-gray-300 pl-1 text-xl">Current Admins</h1>
              <AddAdminModal />
            </div>
            <div className="rounded-lg  px-5 py-4 text-white bg-[#031523] flex space-x-4 text-sm">
              <p className="text-[#38E8C6] border max-w-max px-2 rounded-full border-[#38E8C6]">0xf8d6e0586b0a20c7</p>
              <p className="text-[#38E8C6] border max-w-max px-2 rounded-full border-[#38E8C6]">0xf8d6e0586b0a20c7</p>
            </div>
          </div>
          <div className="flex justify-between">
            <h1 className='text-2xl text-gray-300'>Treasury Withdrawal Requests</h1>
          </div>

          <div className='flex flex-col space-y-5'>
            {Object.keys(treasuryInfo.pendingProposals).map(proposalId => {
              const proposal = treasuryInfo.pendingProposals[proposalId];
              return (
                <Link href={`/withdraw/${proposalId}`}>
                  <div key={proposalId} className='rounded-lg bg-[#00344B] text-white hover:bg-[#0f4962] flex cursor-pointer items-center py-4 px-9 justify-between'>
                    <div className='flex items-center space-x-3'>
                      <p className='text-lg font-semibold text-gray-400'>#{proposal.id}</p>
                      <h2 className='text-xl font-semibold text-gray-200'>{proposal.proposedBy}</h2>
                      <p className='text-sm text-gray-400 pl-10 truncate ...  w-1/2'>
                        {proposal.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
}