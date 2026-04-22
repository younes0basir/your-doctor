import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className='px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 bg-gray-50'>

      {/* Title Section */}
      <div className='text-center mb-12 md:mb-16 py-20'>
        <h2 className='text-3xl md:text-4xl font-light text-gray-600'>
          À PROPOS DE <span className='text-[#ff5a5f] font-semibold'>NOUS</span>
        </h2>
        <div className='w-20 h-1 bg-[#ff5a5f] mx-auto mt-4'></div>
      </div>

      {/* Image + Text Section */}
      <div className='flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 mb-16 md:mb-20 items-center'>
        <img 
          className='w-full md:w-1/2 lg:max-w-[500px] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300' 
          src={assets.about_image} 
          alt="About Prescripto" 
        />
        <div className='flex flex-col justify-center gap-4 md:gap-5 text-gray-600 w-full md:w-1/2'>
          <p className='text-lg md:text-xl leading-relaxed'>
            Bienvenue sur Prescripto, votre partenaire de confiance pour gérer vos besoins en matière de santé de manière pratique et efficace.
          </p>
          <p className='text-lg md:text-xl leading-relaxed'>
            Prescripto s'engage à l'excellence en matière de technologie de la santé. Nous nous efforçons continuellement d'améliorer notre plateforme.
          </p>
          <h3 className='text-gray-800 font-semibold text-xl md:text-2xl mt-2 md:mt-4'>
            Notre Vision
          </h3>
          <p className='text-lg md:text-xl leading-relaxed'>
            Notre vision chez Prescripto est de créer une expérience de santé transparente pour chaque utilisateur.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className='mb-12 md:mb-16'>
        <h2 className='text-2xl md:text-3xl mb-8 md:mb-12 text-center font-light'>
          POURQUOI <span className='text-[#ff5a5f] font-semibold'>NOUS CHOISIR</span>
        </h2>
        
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
          {[
            {
              title: "EFFICACITÉ",
              text: "Un système rationalisé de prise de rendez-vous qui s'adapte à votre mode de vie chargé."
            },
            {
              title: "CONVENANCE",
              text: "Accès à un réseau de professionnels de santé de confiance dans votre région."
            },
            {
              title: "PERSONNALISATION",
              text: "Recommandations et rappels sur mesure pour vous aider à gérer votre santé."
            }
          ].map((item, index) => (
            <div 
              key={index}
              className='border border-gray-200 rounded-lg p-6 md:p-8 flex flex-col gap-3 hover:bg-[#ff5a5f] hover:text-white transition-all duration-300 cursor-pointer bg-white shadow-md hover:shadow-lg'
            >
              <b className='text-lg md:text-xl text-[#ff5a5f] group-hover:text-white'>{item.title}</b>
              <p className='text-base md:text-lg'>{item.text}</p>
              <div className='w-10 h-1 bg-gray-200 mt-2 group-hover:bg-white'></div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission Statement */}
      <div className='bg-[#ff5a5f] text-white p-8 md:p-12 lg:p-16 rounded-xl text-center'>
        <h3 className='text-2xl md:text-3xl font-semibold mb-4 md:mb-6'>Notre Mission</h3>
        <p className='text-lg md:text-xl max-w-4xl mx-auto leading-relaxed'>
          Transformer l'expérience des soins de santé grâce à une technologie innovante qui donne aux patients et aux prestataires les outils dont ils ont besoin pour des résultats optimaux.
        </p>
      </div>

    </div>
  )
}

export default About