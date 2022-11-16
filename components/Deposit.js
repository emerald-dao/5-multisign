import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import * as fcl from "@onflow/fcl";
import { useAuth } from '../contexts/AuthContext';

export default function DepositModal({ refreshInfo }) {
  let [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const { getBalance } = useAuth();

  async function depositToTreasury() {
    setProcessing(true);
    const transactionId = await fcl.mutate({
      cadence: `
      import Multisign from 0xDeployer
      import FlowToken from 0xFlowToken

      transaction(
        treasuryAddress: Address,
        amount: UFix64,
        description: String
      ) {

          let Treasury: &Multisign.Treasury{Multisign.TreasuryPublic}
          let FlowVault: @FlowToken.Vault
          let Donor: Address

          prepare(signer: AuthAccount) {
            if signer.borrow<&Multisign.Treasury>(from: Multisign.TreasuryStoragePath) == nil {
                  signer.save(<- Multisign.createTreasury(admins: [signer.address]), to: Multisign.TreasuryStoragePath)
                  signer.link<&Multisign.Treasury{Multisign.TreasuryPublic}>(Multisign.TreasuryPublicPath, target: Multisign.TreasuryStoragePath)
            }

            self.Treasury = getAccount(treasuryAddress).getCapability(Multisign.TreasuryPublicPath)
                            .borrow<&Multisign.Treasury{Multisign.TreasuryPublic}>()
                            ?? panic("There does not exist a treasury here.")

            let flowVaultRef = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)!
            self.FlowVault <- flowVaultRef.withdraw(amount: amount) as! @FlowToken.Vault
            
            self.Donor = signer.address
          }

          execute {
            self.Treasury.deposit(
              flowVault: <- self.FlowVault,
              description: description,
              donor: self.Donor
            )
          }
      }
      `,
      args: (arg, t) => [
        arg('0xf8d6e0586b0a20c7', t.Address),
        arg(parseFloat(amount).toFixed(3), t.UFix64),
        arg(description, t.String)
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
    getBalance();
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="w-full">
        <button
          type="button"
          onClick={openModal}
          className="rounded-lg px-9 py-2 border bg-[#2bbc9f] border-green-600 text-white w-full"
        >
          Deposit
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
                    Treasury Deposit
                  </Dialog.Title>
                  <div className="mt-2 text-left flex flex-col items-center">
                    <div className="flex flex-col">
                      <label className="text-gray-300 text-xs mb-3"> Amount</label>
                      <input type="text" placeholder='000'
                        className='px-7 py-2 focus:outline-none text-gray-200 focus:border-[#38E8C6] 
                        bg-[#00344B] border rounded-lg  border-gray-400' onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="flex flex-col pt-8">
                      <label className="text-gray-300 text-xs mb-3"> Description</label>
                      <input type="text" placeholder='A gift for the treasury...'
                        className='px-7 py-3  focus:outline-none text-gray-200 focus:border-[#38E8C6] 
                        bg-[#00344B] border rounded-lg  border-gray-400' onChange={(e) => setDescription(e.target.value)} />
                    </div>
                  </div>

                  <div className="mt-7">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-6 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={depositToTreasury}
                    >
                      {!processing ? 'Deposit' : 'Depositing...'}
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