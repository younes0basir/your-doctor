import React from 'react';
import { assets } from '../assets/assets';
import { FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-20 pb-10 px-5 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-2">
           <div onClick={() => navigate('/')} className="cursor-pointer flex items-center">
                       <img
                         className="h-10"
                         src={assets.logo_L}
                         alt="Logo"
                       />
                       <span className="ml-2 text-xl font-bold text-gray-600 hidden sm:block">YOUR DOCTOR</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              Your Doctor est une plateforme en ligne pour la réservation de rendez-vous avec votre fournisseur de soins de santé préféré.
              Il simplifie le processus et offre des informations sur le médecin et ses services.
            </p>
            <div className="flex gap-4">
              <a href="#" className="bg-[#ff5a5f] text-white p-2 rounded-full hover:bg-[#e04a50] transition-colors">
                <FaFacebookF size={14} />
              </a>
              <a href="#" className="bg-[#ff5a5f] text-white p-2 rounded-full hover:bg-[#e04a50] transition-colors">
                <FaTwitter size={14} />
              </a>
              <a href="#" className="bg-[#ff5a5f] text-white p-2 rounded-full hover:bg-[#e04a50] transition-colors">
                <FaInstagram size={14} />
              </a>
              <a href="#" className="bg-[#ff5a5f] text-white p-2 rounded-full hover:bg-[#e04a50] transition-colors">
                <FaLinkedinIn size={14} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">ENTREPRISE</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-[#ff5a5f] transition-colors">Accueil</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#ff5a5f] transition-colors">À propos</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#ff5a5f] transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-[#ff5a5f] transition-colors">Politique de confidentialité</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">NOUS CONTACTER</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-600">
                <FaPhone className="text-[#ff5a5f]" />
                +212 123 456
              </li>
              <li className="flex items-center gap-2 text-gray-600">
                <FaEnvelope className="text-[#ff5a5f]" />
                contact@yourdoctors.com
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Your Doctor. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;