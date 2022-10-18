import Link from 'next/link';
import * as fcl from "@onflow/fcl";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className='flex justify-center pt-20'>
      <div className='w-[70%] space-y-6'>

      </div>
    </div>
  )
}


