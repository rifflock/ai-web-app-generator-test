
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

const CustomHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Logo className="mr-6" />
        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/crews"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/crews') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Crews
              </Link>
              <Link
                to="/messages"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/messages') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Messages
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Home
              </Link>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default CustomHeader;
