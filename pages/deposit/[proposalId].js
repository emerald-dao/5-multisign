import Link from 'next/link';
import * as fcl from "@onflow/fcl";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function DepositInfo() {
  const router = useRouter();
  const { proposalId } = router.query;
  const [depositInfo, setDepositInfo] = useState({});

  useEffect(() => {
    if (proposalId) {
      getDepositInfo();
    }
  }, [proposalId])

  async function getDepositInfo() {
    const result = await fcl.query({
      cadence: `
      import Multisign from 0xDeployer

      pub fun main(treasuryAddress: Address, proposalId: UInt64): Multisign.Deposit? {
          let treasury = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                            .borrow<&Multisign.Treasury{Multisign.TreasuryPublic}>()
                            ?? panic("There does not exist a treasury here.")

          return treasury.deposits[proposalId]
      }
      `,
      args: (arg, t) => [
        arg(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, t.Address),
        arg(proposalId, t.UInt64)
      ]
    });

    console.log(result);

    setDepositInfo(result);
  }

  if (depositInfo.id) {
    return (
      <div className='flex justify-center pt-20 '>
        <div className='w-[70%] space-y-10 flex justify-center'>
          <Link href='/'>
            <a>
              <div className='flex text-white space-x-3'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg><p>go back</p></div>
            </a>
          </Link>
          <div className='bg-[#00344B] md:w-[70%] p-5 rounded-lg'>
            <div className='flex mb-6 justify-between items-center'>
              <div>
                <h1 className='text-gray-200 text-xl font-bold'>#{depositInfo.id}</h1>
              </div>

            </div>

            <div className='flex items-center space-x-3'>
              <p className='text-gray-300'>Amount Deposited:</p>
              <p className='text-[#2bbc9f]'>{depositInfo.amount} FLOW</p>
            </div>
            <div className='flex items-center pt-8 space-x-3'>
              <p className='text-gray-300'>Deposited by:</p>
              <p className='text-[#2bbc9f]'>{depositInfo.proposedBy}</p>
            </div>
            <div className='pt-8 space-y-3'>
              <p className='text-gray-300'>Description: <span className='text-gray-400'>{depositInfo.description}</span></p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}