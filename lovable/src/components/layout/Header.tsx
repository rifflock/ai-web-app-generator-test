
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, MessageSquare, Ship } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/ui/Logo';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Logo size="md" variant="full" />
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-nautical-blue ${location.pathname === '/' ? 'text-nautical-blue' : 'text-muted-foreground'}`}>
            Home
          </Link>
          <Link to="/about" className={`text-sm font-medium transition-colors hover:text-nautical-blue ${location.pathname === '/about' ? 'text-nautical-blue' : 'text-muted-foreground'}`}>
            About
          </Link>
          <Link to="/features" className={`text-sm font-medium transition-colors hover:text-nautical-blue ${location.pathname === '/features' ? 'text-nautical-blue' : 'text-muted-foreground'}`}>
            Features
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-nautical-blue ${location.pathname === '/dashboard' ? 'text-nautical-blue' : 'text-muted-foreground'}`}>
                Dashboard
              </Link>
              <Link to="/messages" className={`text-sm font-medium transition-colors hover:text-nautical-blue ${location.pathname === '/messages' ? 'text-nautical-blue' : 'text-muted-foreground'}`}>
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  Messages
                </span>
              </Link>
              <Button variant="ghost" onClick={logout} className="text-sm font-medium">
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-nautical-blue hover:bg-nautical-blue/90 text-white rounded-full px-6">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
        
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg animate-fade-in">
          <div className="container mx-auto py-4 px-6 flex flex-col space-y-4">
            <Link to="/" className="py-2 text-foreground hover:text-nautical-blue transition-colors">
              Home
            </Link>
            <Link to="/about" className="py-2 text-foreground hover:text-nautical-blue transition-colors">
              About
            </Link>
            <Link to="/features" className="py-2 text-foreground hover:text-nautical-blue transition-colors">
              Features
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="py-2 text-foreground hover:text-nautical-blue transition-colors flex items-center">
                  <Ship size={16} className="mr-2" />
                  Dashboard
                </Link>
                <Link to="/messages" className="py-2 text-foreground hover:text-nautical-blue transition-colors flex items-center">
                  <MessageSquare size={16} className="mr-2" />
                  Messages
                </Link>
                <Button variant="ghost" onClick={logout} className="justify-start px-0 flex items-center">
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth" className="w-full">
                <Button className="w-full bg-nautical-blue hover:bg-nautical-blue/90 text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
