
import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Sailboat, LifeBuoy, Mail, Phone, Instagram, Facebook, Twitter } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-nautical-light border-t border-nautical-blue/10 waves-pattern">
      <div className="container mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo size="md" variant="full" />
            <p className="text-muted-foreground text-sm">
              The complete platform for rowing crew management and team organization.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white rounded-full text-nautical-blue shadow-sm hover:bg-nautical-blue hover:text-white transition-colors">
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="p-2 bg-white rounded-full text-nautical-blue shadow-sm hover:bg-nautical-blue hover:text-white transition-colors">
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="p-2 bg-white rounded-full text-nautical-blue shadow-sm hover:bg-nautical-blue hover:text-white transition-colors">
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4 text-nautical-blue">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-muted-foreground text-sm hover:text-nautical-blue transition-colors flex items-center">
                  <Sailboat size={14} className="mr-2 opacity-70" />
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground text-sm hover:text-nautical-blue transition-colors flex items-center">
                  <LifeBuoy size={14} className="mr-2 opacity-70" />
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-muted-foreground text-sm hover:text-nautical-blue transition-colors flex items-center">
                  <HelpCircle size={14} className="mr-2 opacity-70" />
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4 text-nautical-blue">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-muted-foreground text-sm hover:text-nautical-blue transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-muted-foreground text-sm hover:text-nautical-blue transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-muted-foreground text-sm hover:text-nautical-blue transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4 text-nautical-blue">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@rowcrew.com" className="text-muted-foreground text-sm hover:text-nautical-blue transition-colors flex items-center">
                  <Mail size={14} className="mr-2 opacity-70" />
                  info@rowcrew.com
                </a>
              </li>
              <li>
                <a href="tel:+15551234567" className="text-muted-foreground text-sm hover:text-nautical-blue transition-colors flex items-center">
                  <Phone size={14} className="mr-2 opacity-70" />
                  +1 (555) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-nautical-blue/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} RowCrew. All rights reserved.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-nautical-blue transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-nautical-blue transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-nautical-blue transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
