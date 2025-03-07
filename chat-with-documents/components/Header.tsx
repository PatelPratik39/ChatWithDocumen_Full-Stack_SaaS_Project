import { SignedIn, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from './ui/button'
import { FilePlus2 } from 'lucide-react'


const Header = () => {
    return (
        <>
            <div className='flex justify-between items-center h-16 bg-white shadow-md border-b px-4 md:px-8  py-4"'>
                <Link href='/dashboard'>Chat to <span className='text-cyan-600 text-lg font-semibold'>Document</span></Link>
                <SignedIn>
                    <div className="flex items-center space-x-2 px-4 md:px-2 lg:px-2">

                        <Button asChild variant="link" className='hidden md:flex text-lg '>
                            <Link href="/dashboard/upgrade">Pricing</Link>
                        </Button>
                        <Button asChild variant="outline" className='text-cyan-600 text-lg  border-cyan-600' >
                            <Link href="/dashboard">My Documents</Link>
                        </Button>
                        <Button asChild variant="outline" className='text-cyan-600 text-lg font-semibold border-cyan-600' >
                            <Link href="/dashboard/upload"><FilePlus2 className='text-cyan-600 border-cyan-600'/></Link>
                        </Button>
                        {/* Upgrade Button */}
                        <Button className="h-15 w-15 btn-circle border-none" variant="outline" >
                            <UserButton  />
                        </Button>
                    </div>
                </SignedIn>
            </div>
        </>
    )
}

export default Header