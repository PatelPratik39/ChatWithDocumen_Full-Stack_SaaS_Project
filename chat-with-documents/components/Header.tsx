import { SignedIn, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from './ui/button'
import { FilePlus2 } from 'lucide-react'


const Header = () => {
    return (
        <>
            <div className='flex justify-between bg-white shadow-smvp-5 border-b'>
                <Link href='/dashboard'>Chat to <span className='text-cyan-600'>Document</span></Link>
                <SignedIn>
                    <div className='flex items-center space-x-2'>
                        <Button asChild variant="link" className='hidden md:flex'>
                            <Link href="/dashboard/upgrade">Pricing</Link>
                        </Button>
                        <Button asChild variant="outline" >
                            <Link href="/dashboard">My Documents</Link>
                        </Button>
                        <Button asChild variant="outline" >
                            <Link href="/dashboard/upload"><FilePlus2 className='text-cyan-600'/></Link>
                        </Button>
                        {/* Upgradr Button */}
                        <UserButton />
                    </div>
                </SignedIn>
            </div>
        </>
    )
}

export default Header