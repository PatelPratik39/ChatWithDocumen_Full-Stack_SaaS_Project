'use client'

import { useRouter } from 'next/navigation';

const Document = ({ id, name, size, downloadUrl }: { id: string, name: string, size: number, downloadUrl: string }) => {
    const router = useRouter();

    return (
        <div className='flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105
         hover:bg-cyan-600 hover:text-white cursor-pointer group'>
            Document</div>
    )
}

export default Document;