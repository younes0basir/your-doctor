import React from 'react'
import Banner from '../components/Banner'
import Header from '../components/Header'
import FeaturedDoctors from '../components/FeaturedDoctors'


const Home = () => {
  return (
    <div className='container mx-auto mb-4'>
      <Header />
      
      <FeaturedDoctors />
      <Banner />
      

      {/* Add more components or content here as needed */}
    </div>
  )
}

export default Home
