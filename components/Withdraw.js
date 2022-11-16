import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import * as fcl from "@onflow/fcl";

export default function WithdrawModal({ refreshInfo }) {
  let [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  async function createProposal() {
    setProcessing(true);
    const transactionId = await fcl.mutate({
      cadence: `
      import Multisign from 0xDeployer

      transaction(
          treasuryAddress: Address,
          amount: UFix64, 
          description: String,
          transferTo: Address
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
            self.MyTreasury.proposeProposal(
              treasuryAddress: treasuryAddress,
              amount: amount, 
              description: description,
              transferTo: transferTo
            )
          }
      }
      `,
      args: (arg, t) => [
        arg('0xf8d6e0586b0a20c7', t.Address),
        arg(parseFloat(amount).toFixed(3), t.UFix64),
        arg(description, t.String),
        arg(transferTo, t.Address)
      ],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999
    });

    await fcl.tx(transactionId).onceSealed();
    setProcessing(false);
    closeModal();
    refreshInfo();
  }

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <div className="w-full">
        <button
          type="button"
          onClick={openModal}
          className="rounded-lg px-9 py-2 border bg-[#2bbc9f] border-green-600 text-white w-full"
        >
          Withdraw
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full  max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6  shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-300 pb-3"
                  >
                    Treasury Withdrawal Request
                  </Dialog.Title>
                  <div className="mt-2 text-left flex flex-col items-center px-3">
                    <div className="flex flex-col w-full pt-6">
                      <label className="text-gray-300 text-xs mb-3"> Amount</label>
                      <input type="text" placeholder='000'
                        className='px-7 py-2 focus:outline-none text-gray-200 focus:border-[#38E8C6] 
                        bg-[#00344B] border rounded-lg  border-gray-400' onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="flex flex-col pt-6 w-full">
                      <label className="text-gray-300 text-xs mb-3"> Beneficiary</label>
                      <input type="text" placeholder='0x001'
                        className='px-7 py-2 focus:outline-none text-gray-200 focus:border-[#38E8C6] 
                        bg-[#00344B] border rounded-lg  border-gray-400' onChange={(e) => setTransferTo(e.target.value)} />
                    </div>
                    <div className="flex flex-col pt-6 w-full">
                      <label className="text-gray-300 text-xs mb-3"> Description</label>
                      <input type="text" placeholder='Money to buy...'
                        className='px-7 py-3  focus:outline-none text-gray-200 focus:border-[#38E8C6] 
                        bg-[#00344B] border rounded-lg  border-gray-400' onChange={(e) => setDescription(e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-7">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={createProposal}
                    >
                      {!processing ? 'Request Withdraw' : 'Creating Proposal...'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}