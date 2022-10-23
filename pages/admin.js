import Link from 'next/link';
import * as fcl from "@onflow/fcl";
import { useAuth } from "../contexts/AuthContext";

export default function Admin() {
  const { user } = useAuth();

  return (
    <div className='flex justify-center pt-20 '>
      <div className='w-[70%] space-y-10'>
            <div className='flex justify-between'>
                <h1 className='text-2xl text-gray-300'>Treasury Withdrawal Requests</h1>
                <h1 className='text-green-500 font-semibold'>Admin</h1>
            </div>

            <div className='flex flex-col space-y-5'>

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
    </div>
  )
}