import Link from 'next/link';
import * as fcl from "@onflow/fcl";
import { useAuth } from "../../contexts/AuthContext";

export default function Id() {
  const { user } = useAuth();

  return (
    <div className='flex justify-center pt-20 '>
        <div className='w-[70%] space-y-10 flex justify-center'>
            <Link href='/'>
                <a>
                <div className='flex text-white space-x-3'>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg><p>go back</p></div>
                </a>
            </Link>
          <div className='bg-[#00344B] md:w-[70%] p-5 rounded-lg'>
            <div className='flex mb-6 justify-between items-center'>
                <div>
                  <h1 className='text-gray-200 text-xl font-bold'>#ID</h1>
                </div>

            </div>

            <div className='flex items-center pt-8 space-x-3'>
               <p className='text-gray-300'>Amount Deposited:</p>
               <p className='text-[#2bbc9f]'>200 FLOW</p>
            </div>
            <div className='flex items-center pt-8 space-x-3'>
               <p className='text-gray-300'>Deposited by:</p>
               <p className='text-[#2bbc9f]'>0x0000000000</p>
            </div>
            <div className='pt-8 space-y-3'>
               <p className='text-gray-300'>Description:</p>
               <p className='text-gray-400'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
               Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took 
               a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, 
               but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 
               1960s with the release of Letraset sheets containing Lorem Ipsum passages, 
               and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
            </div>
            </div>
        </div>
  </div>
  )
}