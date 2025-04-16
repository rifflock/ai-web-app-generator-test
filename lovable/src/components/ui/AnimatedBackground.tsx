
import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-nautical-light to-white opacity-70"></div>
      
      {/* Animated wave patterns */}
      <div className="absolute top-[15%] -left-[10%] w-[120%] h-[50vh] opacity-10">
        <svg 
          viewBox="0 0 1200 300" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-water-flow"
          preserveAspectRatio="none"
        >
          <path 
            fill="#1A5F7A" 
            d="M0,192L48,202.7C96,213,192,235,288,229.3C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      <div className="absolute top-[35%] -right-[10%] w-[120%] h-[50vh] opacity-10 transform rotate-180">
        <svg 
          viewBox="0 0 1200 300" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-water-flow delay-150"
          preserveAspectRatio="none"
        >
          <path 
            fill="#57C5B6" 
            d="M0,32L48,32C96,32,192,32,288,64C384,96,480,160,576,160C672,160,768,96,864,90.7C960,85,1056,139,1152,149.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-[60%] left-[10%] w-16 h-16 rounded-full bg-nautical-teal/10 backdrop-blur-xl animate-water-flow"></div>
      <div className="absolute top-[25%] right-[15%] w-24 h-24 rounded-full bg-nautical-blue/5 backdrop-blur-xl animate-water-flow delay-300"></div>
      <div className="absolute top-[80%] right-[30%] w-12 h-12 rounded-full bg-nautical-coral/10 backdrop-blur-xl animate-water-flow delay-700"></div>
    </div>
  );
};

export default AnimatedBackground;
