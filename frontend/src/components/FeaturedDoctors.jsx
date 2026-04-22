import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const FeaturedDoctors = () => {
    const [featuredDoctors, setFeaturedDoctors] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('');
    const [allDoctors, setAllDoctors] = useState([]);
    const [hoveredCard, setHoveredCard] = useState(null);
    const navigate = useNavigate();

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [doctorsResponse, specialitiesResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/doctors`),
                    axios.get(`${API_BASE_URL}/api/specialities`)
                ]);
                const doctors = doctorsResponse.data.map(doctor => ({
                    ...doctor,
                    rating: (Math.random() * 1 + 4).toFixed(1) // Simulate rating for demo
                }));
                setAllDoctors(doctors);
                setFeaturedDoctors(doctors.slice(0, 3));
                setSpecialities(specialitiesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter doctors based on search query and selected speciality
    useEffect(() => {
        const filterDoctors = () => {
            let filtered = [...allDoctors];

            if (searchQuery.trim()) {
                const searchLower = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(doctor => 
                    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchLower)
                );
            }

            if (selectedSpeciality) {
                filtered = filtered.filter(doctor => 
                    doctor.speciality_id === parseInt(selectedSpeciality)
                );
            }

            setFeaturedDoctors(filtered.slice(0, 3));
        };

        filterDoctors();
    }, [searchQuery, selectedSpeciality, allDoctors]);

    if (loading) {
        return (
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="h-10 w-64 mx-auto bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                    <div className="h-5 w-96 mx-auto bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="h-64 bg-gray-200 animate-pulse"></div>
                            <div className="p-6 space-y-4">
                                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse mt-6"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h1 className="text-3xl md:text-4xl font-bold text-[#ff5a5f] mb-3">
                    Rencontrez Nos <span className="text-[#333]">Experts Médicaux</span>
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Notre équipe de professionnels dévoués est prête à prendre soin de vous
                </p>
            </motion.div>

            {/* Search and Filter */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col md:flex-row gap-4 mb-12 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher un médecin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]/50 focus:border-transparent text-gray-700 placeholder-gray-400 transition-all duration-300"
                    />
                </div>
                <div className="relative w-full md:w-auto">
                    <select
                        value={selectedSpeciality}
                        onChange={(e) => setSelectedSpeciality(e.target.value)}
                        className="w-full px-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]/50 focus:border-transparent appearance-none bg-white bg-no-repeat bg-[right_1rem_center] bg-[length:1.5em] text-gray-700 transition-all duration-300"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E\")" }}
                    >
                        <option value="">Toutes les spécialités</option>
                        {specialities.map((speciality) => (
                            <option key={speciality.id} value={speciality.id}>
                                {speciality.name}
                            </option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {featuredDoctors.length > 0 ? (
                        featuredDoctors.map((doctor) => (
                            <motion.div
                                key={doctor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4 }}
                                className="relative cursor-pointer"
                                onMouseEnter={() => setHoveredCard(doctor.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                onClick={() => navigate(`/appointment/${doctor.id}`)}
                            >
                                <div className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${hoveredCard === doctor.id ? 'ring-2 ring-[#ff5a5f]/30' : ''}`}>
                                    <div className="relative overflow-hidden h-72">
                                        <img 
                                            src={doctor.image_url || assets.group_profiles} 
                                            alt={`Dr. ${doctor.firstName} ${doctor.lastName}, ${doctor.specialityName}`} 
                                            className="w-full h-full object-cover transition-transform duration-500"
                                            style={{ transform: hoveredCard === doctor.id ? 'scale(1.05)' : 'scale(1)' }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                                            <span className="bg-[#ff5a5f] text-white text-xs font-semibold px-3 py-1 rounded-full">
                                                {doctor.specialityName}
                                            </span>
                                            <span className="bg-white text-[#ff5a5f] text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                                                <svg className="w-3 h-3 mr-1 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                {doctor.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">Dr. {doctor.firstName} {doctor.lastName}</h3>
                                        <p className="text-gray-600 mb-3">{doctor.qualification || 'Médecin spécialiste'}</p>
                                        
                                        <div className="flex items-center text-sm text-gray-500 mb-4">
                                            <svg className="w-4 h-4 mr-2 text-[#ff5a5f]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            {doctor.location || 'Clinique principale'}
                                        </div>
                                        
                                        <div className="flex space-x-2 mb-5">
                                            {['Cardiologie', 'Consultation', 'Urgence'].slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                +{Math.floor(Math.random() * 5) + 1} autres
                                            </span>
                                        </div>
                                        
                                        <div className="flex space-x-3">
                                            <button className="flex-1 bg-[#ff5a5f] hover:bg-[#e04a50] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02]">
                                                Prendre RDV
                                            </button>
                                            <button className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {hoveredCard === doctor.id && (
                                    <motion.div 
                                        className="absolute -bottom-4 left-0 right-0 mx-auto w-11/12 h-2 bg-[#ff5a5f] blur-md opacity-30 rounded-b-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.3 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            className="col-span-3 text-center py-16"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-block p-6 bg-gray-50 rounded-full mb-6">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-2">Aucun médecin trouvé</h3>
                            <p className="text-gray-500 max-w-md mx-auto mb-6">
                                Nous n'avons trouvé aucun médecin correspondant à vos critères. Essayez de modifier votre recherche.
                            </p>
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedSpeciality('');
                                }}
                                className="text-[#ff5a5f] hover:text-[#e04a50] font-medium flex items-center justify-center mx-auto"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Réinitialiser les filtres
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {featuredDoctors.length > 0 && (
                <motion.div 
                    className="mt-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <button className="inline-flex items-center border-2 border-[#ff5a5f] text-[#ff5a5f] hover:bg-[#ff5a5f] hover:text-white font-medium py-3 px-8 rounded-full transition-all duration-300 group">
                        Explorer tous nos médecins
                        <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </motion.div>
            )}
        </section>
    );
};

export default FeaturedDoctors;