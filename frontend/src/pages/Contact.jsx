import React from 'react';
import { assets } from '../assets/assets';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaBriefcase } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className='px-5 md:px-8 lg:px-12 max-w-7xl mx-auto py-20'>
      {/* Header */}
      <div className='text-center py-12'>
        <h2 className='text-3xl md:text-4xl font-bold text-[#ff5a5f] mb-2'>
          Contact <span className='text-gray-800'>Us</span>
        </h2>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          We're here to help and answer any questions you might have.
        </p>
      </div>

      {/* Contact Content */}
      <div className='flex flex-col md:flex-row gap-12 mb-20'>
        {/* Contact Image */}
        <div className='w-full md:w-1/2 lg:w-2/5'>
          <img 
            className='w-full h-full object-cover rounded-xl shadow-lg' 
            src={assets.contact_image} 
            alt="Our office" 
          />
        </div>

        {/* Contact Info */}
        <div className='w-full md:w-1/2 lg:w-3/5 flex flex-col justify-center gap-6'>
          <div>
            <h3 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <FaMapMarkerAlt className='text-[#ff5a5f]' />
              Our Office
            </h3>
            <p className='text-gray-600'>
              123 Medical Avenue<br />
              Casablanca, Morocco
            </p>
          </div>

          <div>
            <h3 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <FaPhone className='text-[#ff5a5f]' />
              Contact Information
            </h3>
            <p className='text-gray-600'>
              Tel: +212 6 12 34 56 78<br />
              <span className='flex items-center gap-1'>
                <FaEnvelope className='text-[#ff5a5f]' /> 
                Email: contact@yourdoctors.com
              </span>
            </p>
          </div>

          <div>
            <h3 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
              <FaBriefcase className='text-[#ff5a5f]' />
              Careers at YourDoctors
            </h3>
            <p className='text-gray-600 mb-4'>
              Learn more about our teams and current job openings.
            </p>
            <button 
              className='border-2 border-[#ff5a5f] text-[#ff5a5f] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#ff5a5f] hover:text-white transition-all duration-300 flex items-center gap-2'
            >
              View Job Openings
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contact Form (Optional - you can add this later) */}
      {/* <div className='mb-20'>
        <h3 className='text-2xl font-bold text-gray-800 mb-6'>Send us a message</h3>
        <form className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          // Form fields would go here
        </form>
      </div> */}
    </div>
  );
};

export default Contact;