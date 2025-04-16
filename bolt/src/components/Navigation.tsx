import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Anchor, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="bg-gradient-to-r from-ocean-700 to-ocean-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-full">
                <Anchor className="h-6 w-6 text-ocean-700" />
              </div>
              <span className="text-xl font-display font-bold tracking-tight">
                Rowing Club
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`font-medium hover:text-ocean-200 transition-colors ${
                isActive('/dashboard') ? 'text-ocean-200' : 'text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/sessions"
              className={`font-medium hover:text-ocean-200 transition-colors ${
                isActive('/sessions') ? 'text-ocean-200' : 'text-white'
              }`}
            >
              Sessions
            </Link>
            <Link
              to="/my-registrations"
              className={`font-medium hover:text-ocean-200 transition-colors ${
                isActive('/my-registrations') ? 'text-ocean-200' : 'text-white'
              }`}
            >
              My Registrations
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-white hover:text-ocean-200 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-ocean-200 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              to="/dashboard"
              className={`block font-medium hover:text-ocean-200 transition-colors ${
                isActive('/dashboard') ? 'text-ocean-200' : 'text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/sessions"
              className={`block font-medium hover:text-ocean-200 transition-colors ${
                isActive('/sessions') ? 'text-ocean-200' : 'text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Sessions
            </Link>
            <Link
              to="/my-registrations"
              className={`block font-medium hover:text-ocean-200 transition-colors ${
                isActive('/my-registrations') ? 'text-ocean-200' : 'text-white'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              My Registrations
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-white hover:text-ocean-200 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}