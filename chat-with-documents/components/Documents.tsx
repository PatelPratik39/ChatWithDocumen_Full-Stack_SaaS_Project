import React from 'react'
import PlaceHolderDocument from './PlaceHolderDocument'
import { auth } from '@clerk/nextjs/server'
import { adminDb } from '@/firebaseAdmin';
import Document from './Document';

const Documnets = async() => {
  auth();
  const {userId} = await auth();
  if(!userId){
    throw new Error('User not found');
  }

 const documentsSnapshot = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .get();

    
  return (
    <div className='flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto'>
      {/* Map Through the documents */}
      {documentsSnapshot.docs.map(doc => {
        const { name, downloadUrl, size } = doc.data();

        return (
          <Document 
            key={doc.id} 
            id={doc.id} 
            name={name} 
            downloadUrl={downloadUrl} 
            size={size} 
          />
        )

      })}

      {/* PlaceholderDocument */}
      <PlaceHolderDocument />
    </div>
  )
}

export default Documnets