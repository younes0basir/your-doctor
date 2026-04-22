// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Portal = () => {
//   const [userType, setUserType] = useState(null);
//   const navigate = useNavigate();

//   if (!userType) {
//     return (
//       <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl w-full">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold text-gray-900">
//               Choose Login Type
//             </h2>
//             <p className="mt-2 text-sm text-gray-600">
//               Select the appropriate portal to access your account
//             </p>
//           </div>

//           <div className="grid md:grid-cols-2 gap-8">
//             {/* Patient Login Card */}
//             <div className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-[#1c2541] transition-all hover:shadow-lg">
//               <div className="flex flex-col items-center text-center">
//                 <div className="w-20 h-20 flex items-center justify-center mb-4">
//                   <img src='src/assets/user_icon.svg' alt="" className="w-20 h-20" />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">Patient Portal</h3>
//                 <p className="text-gray-600 text-sm mb-6">Access your patient account to book appointments and manage your health records</p>
//                 <button
//                   onClick={() => navigate('/login')} // Navigate to /login
//                   className="bg-white text-[#1c2541] border-2 border-[#1c2541] px-8 py-2 rounded-full text-sm hover:bg-[#1c2541] hover:text-white"
//                 >
//                   Login as Patient
//                 </button>
//               </div>
//             </div>

//             {/* Doctor Portal Card */}
//             <div className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-[#1c2541] transition-all hover:shadow-lg">
//               <div className="flex flex-col items-center text-center">
//                 <div className="w-20 h-20 flex items-center justify-center mb-4">
//                   <img src='src/assets/doctor_icon.svg' alt="" className="w-20 h-20" />
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2">Doctor Portal</h3>
//                 <p className="text-gray-600 text-sm mb-6">Access your dashboard to manage appointments and patient records</p>
//                 <button
//                   onClick={() => navigate('/doctor/login')} // Navigate to doctor/login
//                   className="bg-white text-[#1c2541] border-2 border-[#1c2541] px-8 py-2 rounded-full text-sm hover:bg-[#1c2541] hover:text-white"
//                 >
//                   Login as Doctor
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return null; // Return null or a different component if userType is set
// };

// export default Portal;




// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Portal = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#f7fafc] to-[#edf2f7] flex items-center justify-center p-4">
//       <div className="max-w-6xl w-full">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl font-bold text-gray-900 mb-3">
//             Welcome to MedConnect
//           </h2>
//           <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//             Select your portal to access our comprehensive healthcare platform
//           </p>
//         </div>

//         <div className="grid md:grid-cols-2 gap-10">
//           {/* Patient Portal Card */}
//           <div className="relative group">
//             <div className="absolute inset-0 bg-gradient-to-r from-[#ff5a5f] to-[#e04a50] rounded-2xl shadow-xl transform group-hover:-rotate-1 transition duration-300"></div>
//             <div className="relative bg-white p-10 rounded-2xl shadow-lg h-full border border-gray-100 group-hover:shadow-xl transition duration-300">
//               <div className="flex flex-col items-center text-center">
//                 <div className="w-24 h-24 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center mb-6">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#ff5a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-3">Patient Portal</h3>
//                 <p className="text-gray-600 mb-6">
//                   Book appointments, view medical records, and communicate with your healthcare providers
//                 </p>
//                 <button
//                   onClick={() => navigate('/login')}
//                   className="px-8 py-3.5 bg-[#ff5a5f] hover:bg-[#e04a50] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
//                 >
//                   Patient Login
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Doctor Portal Card */}
//           <div className="relative group">
//             <div className="absolute inset-0 bg-gradient-to-r from-[#1c2541] to-[#0b1322] rounded-2xl shadow-xl transform group-hover:rotate-1 transition duration-300"></div>
//             <div className="relative bg-white p-10 rounded-2xl shadow-lg h-full border border-gray-100 group-hover:shadow-xl transition duration-300">
//               <div className="flex flex-col items-center text-center">
//                 <div className="w-24 h-24 bg-[#1c2541]/10 rounded-full flex items-center justify-center mb-6">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#1c2541]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-bold text-gray-900 mb-3">Doctor Portal</h3>
//                 <p className="text-gray-600 mb-6">
//                   Manage appointments, access patient records, and provide telemedicine services
//                 </p>
//                 <button
//                   onClick={() => navigate('/doctor/login')}
//                   className="px-8 py-3.5 bg-[#1c2541] hover:bg-[#0b1322] text-white font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
//                 >
//                   Doctor Login
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="text-center mt-16">
//           <p className="text-gray-500 text-sm">
//             Don't have an account?{' '}
//             <button 
//               onClick={() => navigate('/register')}
//               className="text-[#ff5a5f] hover:underline font-medium"
//             >
//               Register here
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Portal;



// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { assets } from '../assets/assets';

// const Portal = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#fff5f5] py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-4xl w-full space-y-12">
//         {/* Header */}
//         <div className="text-center">
//           <h2 className="text-4xl font-bold text-[#ff5a5f] mb-3">
//             Welcome to MedConnect
//           </h2>
//           <p className="text-lg text-gray-700 max-w-lg mx-auto">
//             Select your portal to continue
//           </p>
//         </div>

//         {/* Cards Container */}
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Patient Card */}
//           <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#ff5a5f]/20 flex flex-col items-center text-center">
//             <div className="w-24 h-24 mb-6 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center">
//               <img 
//                 src={assets.user_icon} 
//                 alt="Patient" 
//                 className="w-14 h-14 object-contain"
//               />
//             </div>
//             <h3 className="text-2xl font-bold text-[#ff5a5f] mb-3">
//               Patient Portal
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Book appointments and manage your health records
//             </p>
//             <button
//               onClick={() => navigate('/login')}
//               className="w-full max-w-xs bg-[#ff5a5f] hover:bg-[#e04a50] text-white px-8 py-3.5 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
//             >
//               Patient Login
//             </button>
//           </div>

//           {/* Doctor Card */}
//           <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-[#ff5a5f]/20 flex flex-col items-center text-center">
//             <div className="w-24 h-24 mb-6 bg-[#ff5a5f]/10 rounded-full flex items-center justify-center">
//               <img 
//                 src={assets.doctor_icon} 
//                 alt="Doctor" 
//                 className="w-14 h-14 object-contain"
//               />
//             </div>
//             <h3 className="text-2xl font-bold text-[#ff5a5f] mb-3">
//               Doctor Portal
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Manage appointments and patient records
//             </p>
//             <button
//               onClick={() => navigate('/doctor/login')}
//               className="w-full max-w-xs bg-[#ff5a5f] hover:bg-[#e04a50] text-white px-8 py-3.5 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
//             >
//               Doctor Login
//             </button>
//           </div>
//         </div>

//         {/* Footer CTA */}
//         <div className="text-center pt-8">
//           <p className="text-gray-600">
//             Don't have an account?{' '}
//             <button 
//               onClick={() => navigate('/register')}
//               className="text-[#ff5a5f] font-semibold hover:underline"
//             >
//               Register here
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Portal;



import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaUserMd, FaArrowRight } from 'react-icons/fa';

const Portal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] py-12 px-4">
      <div className="max-w-md w-full space-y-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#ff5a5f] mb-2">Welcome Back</h1>
          <p className="text-gray-600">Select your login portal to continue</p>
        </div>

        <div className="space-y-6">
          {/* Patient Portal */}
          <div 
            onClick={() => navigate('/login')}
            className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-[#ff5a5f] cursor-pointer transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#ff5a5f]/10 rounded-full">
                  <FaUser className="text-2xl text-[#ff5a5f]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Patient Portal</h3>
                  <p className="text-sm text-gray-500">Book appointments & view records</p>
                </div>
              </div>
              <FaArrowRight className="text-gray-400 group-hover:text-[#ff5a5f] transition-colors" />
            </div>
          </div>

          {/* Doctor Portal */}
          <div 
            onClick={() => navigate('/doctor/login')}
            className="group p-6 bg-white rounded-xl border border-gray-200 hover:border-[#ff5a5f] cursor-pointer transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#ff5a5f]/10 rounded-full">
                  <FaUserMd className="text-2xl text-[#ff5a5f]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Doctor Portal</h3>
                  <p className="text-sm text-gray-500">Manage appointments & patients</p>
                </div>
              </div>
              <FaArrowRight className="text-gray-400 group-hover:text-[#ff5a5f] transition-colors" />
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <button 
              onClick={() => navigate('/contact')}
              className="text-[#ff5a5f] font-medium hover:underline"
            >
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Portal;