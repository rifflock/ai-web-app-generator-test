
import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Waves } from 'lucide-react';

type LogoProps = {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className = '' 
}) => {
  // Size mappings
  const sizes = {
    sm: {
      iconSize: 20,
      containerSize: 'w-7 h-7',
      textSize: 'text-lg'
    },
    md: {
      iconSize: 24,
      containerSize: 'w-9 h-9',
      textSize: 'text-xl'
    },
    lg: {
      iconSize: 32, 
      containerSize: 'w-12 h-12',
      textSize: 'text-2xl'
    }
  };

  const { iconSize, containerSize, textSize } = sizes[size];

  return (
    <Link 
      to="/" 
      className={`flex items-center space-x-2 ${className}`}
    >
      <div className={`${containerSize} bg-nautical-blue rounded-md flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0">
          <span className="absolute inset-0 flex items-center justify-center text-white">
            <Anchor size={iconSize} strokeWidth={2.5} />
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-3 opacity-40">
            <Waves 
              size={containerSize} 
              className="text-nautical-teal animate-wave" 
            />
          </div>
        </div>
      </div>
      {variant === 'full' && (
        <span className={`${textSize} font-display font-semibold tracking-tight text-nautical-blue`}>
          RowCrew
        </span>
      )}
    </Link>
  );
};

export default Logo;
