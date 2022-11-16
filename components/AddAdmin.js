import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import * as fcl from "@onflow/fcl";
import { useAuth } from '../contexts/AuthContext';

export default function AddAdminModal({ refreshInfo }) {
  let [isOpen, setIsOpen] = useState(false)
  const [processing, setProcessing] = useState(false);
  const [newAdmin, setNewAdmin] = useState('');

  async function addAdmin() {
    setProcessing(true);
    const transactionId = await fcl.mutate({
      cadence: `
      import Multisign from 0xDeployer

      transaction(newAdmin: Address) {

          let MyTreasury: &Multisign.Treasury

          prepare(signer: AuthAccount) {
            if signer.borrow<&Multisign.Treasury>(from: Multisign.TreasuryStoragePath) == nil {
                  signer.save(<- Multisign.createTreasury(admins: [signer.address]), to: Multisign.TreasuryStoragePath)
                  signer.link<&Multisign.Treasury{Multisign.TreasuryPublic}>(Multisign.TreasuryPublicPath, target: Multisign.TreasuryStoragePath)
            }

            self.MyTreasury = signer.borrow<&Multisign.Treasury>(from: Multisign.TreasuryStoragePath)!
          }

          execute {
            self.MyTreasury.addSigner(admin: newAdmin)
          }
      }
      `,
      args: (arg, t) => [
        arg(newAdmin, t.Address)
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
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="">
        <button
          type="button"
          onClick={openModal}
          className="rounded-lg px-9 py-2 border bg-[#2bbc9f] border-green-600 text-white max-w-max"
        >
          Add Admin
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
                    Add new Admin
                  </Dialog.Title>
                  <div className="mt-2 text-left flex flex-col items-center px-10">
                    <div className="flex flex-col w-full">
                      <label className="text-gray-300 text-xs mb-3"> Address</label>
                      <input type="text" placeholder='0xf8d6e0586b0a20c7'
                        className='px-7 py-2 focus:outline-none text-gray-200 focus:border-[#38E8C6] 
                        bg-[#00344B] border rounded-lg  border-gray-400' onChange={(e) => setNewAdmin(e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-7">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={addAdmin}
                    >
                      {processing ? 'Adding Admin...' : 'Add Admin'}
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