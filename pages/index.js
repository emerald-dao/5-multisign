import Link from 'next/link';
import * as fcl from "@onflow/fcl";
import { useAuth } from "../contexts/AuthContext";
import MyModal from '../components/Deposit';
import DepositModal from '../components/Deposit';
import WithdrawModal from '../components/Withdraw';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className='flex justify-center pt-20'>
      <div className='w-[70%] space-y-6'>
{/*      for only admins when they are logged in   
          <Link href='/admin'>
            <a className='text-lg font-semibold text-green-400 justify-end flex'>
              <p>View Pending Requests</p>
            </a>
          </Link> */}
          <div className='rounded-lg h-56 flex flex-col justify-between p-4 bg-[#00344B] shadow-lg shadow-blue-400/20'>
            <div className='pl-4 '>
              <h1 className='text-gray-400 text-sm'>Total Balance</h1>
              <h1 className='text-green-400 text-3xl'>120,000 FLOW</h1>
              <p className='text-gray-400 pl-1'>($320,000)</p>
            </div>

            <div className='flex justify-between px-5 space-x-4'>
              <DepositModal />
              <WithdrawModal />
             </div>
          </div>

          <div className='pt-5'>
            <h1 className='text-[#2bbc9f] text-lg'>Transaction History</h1>
          </div>
          
          <Link href='/did'>
            <a className='rounded-lg bg-[#00344B] text-white hover:bg-[#0f4962] flex cursor-pointer items-center py-4 px-9 justify-between'>
                  <div className='flex items-center space-x-3'>
                    <p className='text-lg font-semibold text-gray-400'>#234</p>
                    
                    <h2 className='text-xl font-semibold text-gray-200'>0x7979070909989</h2>
                    <p className='text-sm text-gray-400 pl-10 truncate ...  w-1/2'>
                      Money for Jacob to take his imaginary girlfriend out
                    </p>
                  </div>
                      <div className='font-semibold text-[#2bbc9f]'>+ 20 FLOW</div>
              </a>
          </Link>

          <Link href='/did'>
            <a className='rounded-lg bg-[#00344B] text-white hover:bg-[#0f4962] flex cursor-pointer items-center py-4 px-9 justify-between'>
                <div className='flex items-center space-x-3'>
                  <p className='text-lg font-semibold text-gray-400'>#234</p>
                  
                  <h2 className='text-xl font-semibold text-gray-200'>0x7979070909989</h2>
                  <p className='text-sm text-gray-400 pl-10 truncate ...  w-1/2'>
                    Money for Jacob to take his imaginary girlfriend out
                  </p>
                </div>
                    <div className='font-semibold text-red-500'>- 20 FLOW</div>
            </a>
          </Link>

            <div className='rounded-lg bg-[#00344B] text-white hover:bg-[#0f4962] flex cursor-pointer items-center py-4 px-9 justify-between'>
                <div className='flex items-center space-x-3'>
                  <p className='text-lg font-semibold text-gray-400'>#234</p>
                  
                  <h2 className='text-xl font-semibold text-gray-200'>0x7979070909989</h2>
                  <p className='text-sm text-gray-400 pl-10 truncate ...  w-1/2'>
                    Money for Jacob to take his imaginary girlfriend out
                  </p>
                </div>
                    <div className='font-semibold text-gray-400'>Pending</div>
            </div>
      </div>
    </div>
  )
}


