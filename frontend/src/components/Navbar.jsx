// import React, { useContext, useState, useEffect } from 'react';
// import { assets } from '../assets/assets';
// import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
// import { AppContext } from '../context/AppContext';

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [showMenu, setShowMenu] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const { token, setToken, userData } = useContext(AppContext);
//   const location = useLocation();

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Hide navbar on doctor routes
//   if (location.pathname.startsWith('/doctor')) {
//     return null;
//   }

//   const logout = () => {
//     localStorage.removeItem('token');
//     setToken(false);
//     navigate('/login');
//     setShowMenu(false);
//   };

//   return (
//     <header className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 backdrop-blur-sm py-4'}`}>
//       <div className="container mx-auto px-4">
//         <div className="flex items-center justify-between">
//           {/* Logo */}
//           <div onClick={() => navigate('/')} className="cursor-pointer">
//             <img
//               className={`h-10 transition-all duration-300 ${scrolled ? 'h-9' : 'h-10'}`}
//               src={assets.logo}
//               alt="Logo"
//             />
//           </div>

//           {/* Desktop Menu */}
//           <nav className="hidden md:flex items-center gap-1">
//             <NavLink 
//               to="/" 
//               className={({ isActive }) => 
//                 `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:text-[#ff5a5f] hover:bg-[#ff5a5f]/5'}`
//               }
//             >
//               ACCUEIL
//             </NavLink>
//             <NavLink 
//               to="/list-of-doctors" 
//               className={({ isActive }) => 
//                 `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:text-[#ff5a5f] hover:bg-[#ff5a5f]/5'}`
//               }
//             >
//               TOUS LES MÉDECINS
//             </NavLink>
//             <NavLink 
//               to="/about" 
//               className={({ isActive }) => 
//                 `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:text-[#ff5a5f] hover:bg-[#ff5a5f]/5'}`
//               }
//             >
//               À PROPOS
//             </NavLink>
//             <NavLink 
//               to="/contact" 
//               className={({ isActive }) => 
//                 `px-4 py-2 rounded-lg font-medium text-sm transition-colors ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:text-[#ff5a5f] hover:bg-[#ff5a5f]/5'}`
//               }
//             >
//               CONTACT
//             </NavLink>
//           </nav>

//           {/* User Actions */}
//           <div className="flex items-center gap-4">
//             {token && userData ? (
//               <div className="flex items-center gap-2 cursor-pointer group relative">
//                 <div className="relative">
//                   <img
//                     className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
//                     src={userData.image || assets.upload_area}
//                     alt="Profile"
//                   />
//                   <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
//                 </div>
//                 <svg className="w-4 text-gray-500 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//                 </svg>
//                 <div className="absolute top-full right-0 pt-2 text-base font-medium text-gray-600 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
//                   <div className="min-w-48 bg-white rounded-lg shadow-xl flex flex-col gap-1 p-2 border border-gray-100">
//                     <Link
//                       to="/my-profile"
//                       className="px-4 py-2 rounded-md hover:bg-gray-50 hover:text-[#ff5a5f] transition-colors"
//                     >
//                       Mon Profil
//                     </Link>
//                     <button
//                       onClick={() => {
//                         navigate('/my-appointments');
//                         setShowMenu(false);
//                       }}
//                       className="px-4 py-2 rounded-md hover:bg-gray-50 hover:text-[#ff5a5f] transition-colors text-left"
//                     >
//                       Mes Rendez-vous
//                     </button>
//                     <button
//                       onClick={logout}
//                       className="px-4 py-2 rounded-md hover:bg-gray-50 hover:text-[#ff5a5f] transition-colors text-left"
//                     >
//                       Déconnexion
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <button
//                 onClick={() => navigate('/portal')}
//                 className="hidden md:flex items-center gap-2 bg-[#ff5a5f] hover:bg-[#e04a50] text-white px-6 py-2.5 rounded-full font-medium text-sm transition-colors shadow-sm hover:shadow-md"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
//                 </svg>
//                 Portal
//               </button>
//             )}

//             {/* Mobile Menu Button */}
//             <button
//               onClick={() => setShowMenu(true)}
//               className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
//               aria-label="Menu"
//             >
//               <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu Overlay */}
//       <div
//         className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${showMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
//         onClick={() => setShowMenu(false)}
//       ></div>

//       {/* Mobile Menu Content */}
//       <div
//         className={`fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl transition-transform duration-300 ease-in-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}
//       >
//         <div className="flex items-center justify-between p-6 border-b border-gray-100">
//           <img src={assets.logo} className="h-8" alt="Logo" />
//           <button
//             onClick={() => setShowMenu(false)}
//             className="p-2 rounded-full hover:bg-gray-100 transition-colors"
//             aria-label="Close menu"
//           >
//             <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//             </svg>
//           </button>
//         </div>

//         <div className="p-6">
//           <nav className="flex flex-col gap-1">
//             <NavLink 
//               onClick={() => setShowMenu(false)}
//               to="/" 
//               className={({ isActive }) => 
//                 `px-4 py-3 rounded-lg font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
//               }
//             >
//               ACCUEIL
//             </NavLink>
//             <NavLink 
//               onClick={() => setShowMenu(false)}
//               to="/list-of-doctors" 
//               className={({ isActive }) => 
//                 `px-4 py-3 rounded-lg font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
//               }
//             >
//               TOUS LES MÉDECINS
//             </NavLink>
//             <NavLink 
//               onClick={() => setShowMenu(false)}
//               to="/about" 
//               className={({ isActive }) => 
//                 `px-4 py-3 rounded-lg font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
//               }
//             >
//               À PROPOS
//             </NavLink>
//             <NavLink 
//               onClick={() => setShowMenu(false)}
//               to="/contact" 
//               className={({ isActive }) => 
//                 `px-4 py-3 rounded-lg font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
//               }
//             >
//               CONTACT
//             </NavLink>
//           </nav>

//           <div className="mt-8 pt-6 border-t border-gray-100">
//             {token ? (
//               <div className="space-y-4">
//                 <Link
//                   to="/my-profile"
//                   onClick={() => setShowMenu(false)}
//                   className="block px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   Mon Profil
//                 </Link>
//                 <button
//                   onClick={() => {
//                     navigate('/my-appointments');
//                     setShowMenu(false);
//                   }}
//                   className="block w-full text-left px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   Mes Rendez-vous
//                 </button>
//                 <button
//                   onClick={logout}
//                   className="block w-full text-left px-4 py-3 rounded-lg font-medium text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   Déconnexion
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={() => {
//                   navigate('/portal');
//                   setShowMenu(false);
//                 }}
//                 className="w-full flex items-center justify-center gap-2 bg-[#ff5a5f] hover:bg-[#e04a50] text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors shadow-sm"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
//                 </svg>
//                 Portal
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Navbar;



import React, { useContext, useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { token, setToken, userData } = useContext(AppContext);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide navbar on doctor routes
  if (location.pathname.startsWith('/doctor')) {
    return null;
  }

  const logout = () => {
    localStorage.removeItem('token');
    setToken(false);
    navigate('/login');
    setShowMenu(false);
  };

  return (
    <header className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-sm py-2' : 'bg-white py-4'}`}>
      <div className="container mx-auto px-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div onClick={() => navigate('/')} className="cursor-pointer flex items-center">
            <img
              className="h-10"
              src={assets.logo_L}
              alt="Logo"
            />
            <span className="ml-2 text-xl font-bold text-gray-600 hidden sm:block">YOUR DOCTOR</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isActive ? 'text-[#ff5a5f]' : 'text-gray-600 hover:text-[#ff5a5f]'}`
              }
            >
              ACCUEIL
            </NavLink>
            <NavLink 
              to="/list-of-doctors" 
              className={({ isActive }) => 
                `px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isActive ? 'text-[#ff5a5f]' : 'text-gray-600 hover:text-[#ff5a5f]'}`
              }
            >
              TOUS LES MÉDECINS
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isActive ? 'text-[#ff5a5f]' : 'text-gray-600 hover:text-[#ff5a5f]'}`
              }
            >
              À PROPOS
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `px-4 py-2.5 rounded-md font-medium text-sm transition-all ${isActive ? 'text-[#ff5a5f]' : 'text-gray-600 hover:text-[#ff5a5f]'}`
              }
            >
              CONTACT
            </NavLink>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {token && userData ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/my-appointments')}
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-[#ff5a5f] hover:bg-gray-50 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Mes Rendez-vous
                </button>
                
                <div className="relative group">
                  <div className="flex items-center gap-2 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gray-100 border-2 border-white overflow-hidden">
                      <img
                        className="w-full h-full object-cover"
                        src={userData.image || assets.upload_area}
                        alt="Profile"
                      />
                    </div>
                    <svg className="w-4 h-4 text-gray-400 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                  
                  <div className="absolute right-0 top-full mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
                    <div className="py-1">
                      <Link
                        to="/my-profile"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#ff5a5f] transition-colors"
                      >
                        Mon Profil
                      </Link>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#ff5a5f] transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="hidden sm:block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#ff5a5f] transition-colors"
                >
                  Connexion
                </button>
                <button
                  onClick={() => navigate('/portal')}
                  className="px-4 py-2.5 bg-[#ff5a5f] hover:bg-[#e04a50] text-white text-sm font-medium rounded-md transition-colors shadow-sm hover:shadow-md flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  Portal
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMenu(true)}
              className="md:hidden p-2 -mr-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${showMenu ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={() => setShowMenu(false)}
      ></div>

      {/* Mobile Menu Content */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center">
            <img src={assets.logo_L} className="h-7" alt="Logo" />
            <span className="ml-2 text-lg font-bold text-[#1a1a1a]">MedConnect</span>
          </div>
          <button
            onClick={() => setShowMenu(false)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-5 h-[calc(100%-68px)] overflow-y-auto">
          <div className="flex flex-col h-full">
            <nav className="flex flex-col gap-1 mb-6">
              <NavLink 
                onClick={() => setShowMenu(false)}
                to="/" 
                className={({ isActive }) => 
                  `px-4 py-3 rounded-md font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                ACCUEIL
              </NavLink>
              <NavLink 
                onClick={() => setShowMenu(false)}
                to="/list-of-doctors" 
                className={({ isActive }) => 
                  `px-4 py-3 rounded-md font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                TOUS LES MÉDECINS
              </NavLink>
              <NavLink 
                onClick={() => setShowMenu(false)}
                to="/about" 
                className={({ isActive }) => 
                  `px-4 py-3 rounded-md font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                À PROPOS
              </NavLink>
              <NavLink 
                onClick={() => setShowMenu(false)}
                to="/contact" 
                className={({ isActive }) => 
                  `px-4 py-3 rounded-md font-medium text-sm ${isActive ? 'text-[#ff5a5f] bg-[#ff5a5f]/10' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                CONTACT
              </NavLink>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
              {token ? (
                <div className="space-y-4">
                  <Link
                    to="/my-profile"
                    onClick={() => setShowMenu(false)}
                    className="block px-4 py-3 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Mon Profil
                  </Link>
                  <button
                    onClick={() => {
                      navigate('/my-appointments');
                      setShowMenu(false);
                    }}
                    className="block w-full text-left px-4 py-3 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    Mes Rendez-vous
                  </button>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-3 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      navigate('/login');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-50 text-left"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => {
                      navigate('/portal');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 bg-[#ff5a5f] hover:bg-[#e04a50] text-white font-medium rounded-md transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                    </svg>
                    Portal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;