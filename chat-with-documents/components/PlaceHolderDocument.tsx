'use client'

import { FilePlus } from 'lucide-react';
import React from 'react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation';

const PlaceHolderDocument = () => {
  const router = useRouter();


  const handleClick = () => {
    // check if user is free tier and if they are over the file limit upload, push the upgarde the tier page
    router.push('/dashboard/upload')
  }

  return (
    <Button onClick={handleClick} className='flex flex-col items-center justify-center w-64 h-80 rounded-xl bg-gray-200 drop-shadow-md text-gray-400'>
      <FilePlus className='h-50 w-50' />
      <p>
        Add a Document
      </p>
    </Button>
  )
}

export default PlaceHolderDocument

 