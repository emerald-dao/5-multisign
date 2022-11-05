import Link from 'next/link';
import * as fcl from "@onflow/fcl";
import { useAuth } from "../contexts/AuthContext";
import DepositModal from '../components/Deposit';
import WithdrawModal from '../components/Withdraw';
import { useEffect, useState } from 'react';

export default function Home() {
  const { user } = useAuth();
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
      <div className='flex justify-center pt-20'>
        <div className='w-[70%] space-y-6'>
          {treasuryInfo.admins.includes(user.addr) ?
            <Link href='/admin'>
              <a className='text-lg font-semibold text-green-400 justify-end flex'>
                <p>View Admin Dashboard</p>
              </a>
            </Link>
            : null}
          <div className='rounded-lg max-h-max flex flex-col justify-between p-4 bg-[#00344B] shadow-lg shadow-blue-400/20 space-y-10'>
            <div className='flex justify-between'>
              <div className='pl-4 '>
                <h1 className='text-gray-300 text-sm'>Total Balance</h1>
                <h1 className='text-green-400 text-3xl pt-3'>{parseFloat(treasuryInfo.balance).toFixed(3)} FLOW</h1>
                <p className='text-gray-400 pl-1'>($320,000)</p>
              </div>
              <div className="space-y-2  rounded-lg px-5 pb- pt-1 max-w-max">
                <h1 className="text-gray-300 pl-3 pb-1">Admins</h1>
                <div className="text-white justify-center grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <p className="text-[#38E8C6] bg-[#03152372]  max-w-max px-4 py-2 rounded-full">0xf8d6e0586b0a20c7</p>
                  <p className="text-[#38E8C6] bg-[#03152372]  max-w-max px-4 py-2 rounded-full">0xf8d6e0586b0a20c7</p>
                  <p className="text-[#38E8C6] bg-[#03152372]  max-w-max px-4 py-2 rounded-full">0xf8d6e0586b0a20c7</p>
                </div>
              </div>

            </div>

            <div className='flex justify-between px-5 space-x-4'>
              <DepositModal refreshInfo={getTreasuryInfo} />
              <WithdrawModal refreshInfo={getTreasuryInfo} />
            </div>
          </div>

          <div className='pt-5'>
            <h1 className='text-[#2bbc9f] text-lg'>Transaction History</h1>
          </div>

          {treasuryInfo.orderedActions.slice(0).reverse().map((action, index) => {
            if (action.type == "Deposit") {
              return (
                <Link href={`/deposit/${action.id}`} key={index}>
                  <a className='rounded-lg bg-[#00344B] text-white hover:bg-[#0f4962] flex cursor-pointer items-center py-4 px-9 justify-between'>
                    <div className='flex items-center space-x-3'>
                      <p className='text-lg font-semibold text-gray-400'>#{action.id}</p>

                      <h2 className='text-xl font-semibold text-gray-200'>{action.proposedBy}</h2>
                      <p className='text-sm text-gray-400 pl-10 truncate ...  w-1/2'>
                        {action.description}
                      </p>
                    </div>
                    <div className='font-semibold text-[#2bbc9f]'>+ {parseFloat(action.amount).toFixed(3)} FLOW</div>
                  </a>
                </Link>
              )
            } else if (action.type == "Completed") {
              return (
                <Link href={`/withdraw/${action.id}`} key={index}>
                  <a className='rounded-lg bg-[#00344B] text-white hover:bg-[#0f4962] flex cursor-pointer items-center py-4 px-9 justify-between'>
                    <div className='flex items-center space-x-3'>
                      <p className='text-lg font-semibold text-gray-400'>#{action.id}</p>

                      <h2 className='text-xl font-semibold text-gray-200'>{action.proposedBy}</h2>
                      <p className='text-sm text-gray-400 pl-10 truncate ...  w-1/2'>
                        {action.description}
                      </p>
                    </div>
                    <div className='font-semibold text-red-500'>- {parseFloat(action.amount).toFixed(3)} FLOW</div>
                  </a>
                </Link>
              )
            } else if (action.type == "Pending") {
              return (
                <Link href={`/withdraw/${action.id}`} key={index}>
                  <div className='rounded-lg bg-[#00344B] text-white hover:bg-[#0f4962] flex cursor-pointer items-center py-4 px-9 justify-between'>
                    <div className='flex items-center space-x-3'>
                      <p className='text-lg font-semibold text-gray-400'>#{action.id}</p>

                      <h2 className='text-xl font-semibold text-gray-200'>{action.proposedBy}</h2>
                      <p className='text-sm text-gray-400 pl-10 truncate ...  w-1/2'>
                        {action.description}
                      </p>
                    </div>
                    <div className='font-semibold text-gray-400'>Pending</div>
                  </div>
                </Link>
              )
            }
          })}
        </div>
      </div>
    )
  }
}


