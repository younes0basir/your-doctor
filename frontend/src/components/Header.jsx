



import React from 'react';

const Header = () => {
  return (
    <div className="relative bg-white overflow-hidden isolate">
      {/* Premium background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl -translate-y-1/4 w-[150%] h-[150%]">
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#ff5a5f]/10 via-[#ff5a5f]/05 to-transparent"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 70%)'
            }}
          />
        </div>
      </div>

      {/* Floating medical icons */}
      <div className="absolute -z-10 inset-0 opacity-10 overflow-hidden">
        <svg className="absolute left-10 top-1/4 w-16 h-16 text-[#ff5a5f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg className="absolute right-20 top-1/3 w-14 h-14 text-[#ff5a5f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <svg className="absolute left-1/4 bottom-1/4 w-12 h-12 text-[#ff5a5f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-28 lg:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#ff5a5f]/10 text-[#ff5a5f] text-sm font-medium backdrop-blur-sm border border-[#ff5a5f]/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Available 24/7 worldwide
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
              Seamless <span className="text-[#ff5a5f]">Healthcare</span> Across Borders
            </h1>

            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              Experience borderless medical care with our global network of certified healthcare providers. Book appointments instantly in multiple languages.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button className="px-8 py-4 bg-[#ff5a5f] hover:bg-[#e04a50] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group">
                <span className="relative group-hover:translate-x-1 transition-transform duration-200">
                  Find Healthcare
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <button className="px-8 py-4 bg-white border-2 border-gray-100 hover:border-[#ff5a5f]/30 text-gray-800 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center group">
                <span className="relative group-hover:translate-x-1 transition-transform duration-200">
                  How It Works
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 text-[#ff5a5f] group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="w-8 h-8 rounded-full bg-[#ff5a5f]/10 border-2 border-white flex items-center justify-center text-xs font-bold text-[#ff5a5f]">
                      {item}
                    </div>
                  ))}
                </div>
                <span><span className="font-semibold text-[#ff5a5f]">50K+</span> patients served</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ff5a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Available in <span className="font-semibold">80+</span> countries</span>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div className="relative">
            {/* Premium image container */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl border-8 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&h=700&q=80" 
                alt="Global healthcare connection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
              
              {/* Floating stats */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-[#ff5a5f] font-bold text-2xl">5,000+</div>
                <div className="text-gray-600 text-sm">Certified Providers</div>
              </div>
              
              <div className="absolute bottom-6 right-6 bg-[#ff5a5f] text-white rounded-xl p-4 shadow-lg">
                <div className="font-bold text-xl">30+</div>
                <div className="text-white/90 text-sm">Languages</div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-6 w-64 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#ff5a5f]/10 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ff5a5f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Instant Booking</div>
                  <div className="text-xs text-gray-500">24/7 availability</div>
                </div>
              </div>
              <button className="w-full py-2 bg-[#ff5a5f] hover:bg-[#e04a50] text-white text-sm font-medium rounded-lg transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;