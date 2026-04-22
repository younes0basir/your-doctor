import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
    const navigate = useNavigate()

    return (
        <div className='flex flex-col md:flex-row bg-gradient-to-r from-[#ff5a5f] to-[#ff7e82] rounded-xl px-6 sm:px-8 md:px-10 lg:px-12 my-10 mx-4 md:mx-6 overflow-hidden shadow-lg'>
            {/* ------- Left Side ------- */}
            <div className='flex-1 py-8 md:py-12 flex flex-col justify-center'>
                <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight'>
                    Prendre Rendez-vous
                </h2>
                <p className='text-lg sm:text-xl md:text-2xl text-white mt-3 mb-6'>
                    Avec Plus de 100 Médecins de Confiance
                </p>
                <button 
                    onClick={() => { navigate('/login'); scrollTo(0, 0) }} 
                    className='bg-white text-[#ff5a5f] font-semibold text-sm sm:text-base px-8 py-3 rounded-full mt-2 hover:scale-105 transition-all duration-300 shadow-md w-fit hover:shadow-lg'
                >
                    Créer un compte
                </button>
                
                {/* Additional trust indicators */}
                <div className='flex items-center mt-6 space-x-4'>
                    <div className='flex items-center'>
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className='ml-1 text-white text-sm'>Consultation rapide</span>
                    </div>
                    <div className='flex items-center'>
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className='ml-1 text-white text-sm'>Professionnels certifiés</span>
                    </div>
                </div>
            </div>

            {/* ------- Right Side ------- */}
            <div className='hidden md:flex md:w-2/5 lg:w-[40%] relative justify-center items-end'>
                <img 
                    className='w-full h-auto max-h-[280px] lg:max-h-[320px] object-contain transform hover:scale-105 transition-transform duration-500' 
                    src={assets.appointment_img} 
                    alt="Doctors team" 
                />
            </div>
        </div>
    )
}

export default Banner