import React from 'react'
import PlaceHolderDocument from './PlaceHolderDocument'

const Documnets = () => {
  return (
    <div className='flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto'>
      {/* Map Through the documents */}

      {/* PlaceholderDocument */}
      <PlaceHolderDocument />
    </div>
  )
}

export default Documnets