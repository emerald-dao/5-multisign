import Link from 'next/link';
import * as fcl from "@onflow/fcl";

export default function WithdrawInfo() {

  return (
    <div className='flex justify-center pt-20 '>
      <div className='w-[70%] space-y-10 flex justify-center'>
        <div className='bg-[#00344B] md:w-[70%] p-5 rounded-lg'>
          <div className='flex mb-12 justify-between items-center'>
            <div>
              <h1 className='text-gray-200 text-xl font-bold'>Money for Jacob</h1>
            </div>

            <div className='text-gray-400 text-sm font-semibold pr-2'>
              <p className='text-gray-300 opacity-75'>Request by: 0x000000000000</p>
            </div>
          </div>
          <div className='flex justify-between bg-[#011E30] px-3 py-2 rounded-lg'>
            <div className='flex space-x-2 items-center'>
              <h1 className='text-[#2bbc9f]'>0x0000000000</h1>
              <p className='text-xs text-gray-400'>approved</p>
            </div>
            <div className='flex space-x-2 items-center'>
              <h1 className='text-[#2bbc9f]'>0x0000000000</h1>
              <p className='text-xs text-gray-400'>Declined</p>
            </div>
            <div className='flex space-x-2 items-center'>
              <h1 className='text-[#2bbc9f]'>0x0000000000</h1>
              <p className='text-xs text-gray-400'>Pending</p>
            </div>
          </div>
          <div className='flex items-center pt-8 space-x-3'>
            <p className='text-gray-300'>Amount requested:</p>
            <p className='text-[#2bbc9f]'>200 FLOW</p>
          </div>
          <div className='flex items-center pt-8 space-x-3'>
            <p className='text-gray-300'>Beneficiary:</p>
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

          <div className='space-x-3 pt-7 flex'>
            <button className='rounded-lg w-full py-2 bg-[#2bbc9f] text-white'>Accept request</button>
            <button className='rounded-lg w-full py-2 bg-[#2bbc9f] text-white'>Decline request</button>
          </div>

          {/*             for when the person has already voted
            <div className='border rounded-lg px-6 py-2 text-[#2bbc9f] border-[#2bbc9f] text-center'>You Accepted/Declined the request</div>
 */}
        </div>
      </div>
    </div>
  )
}