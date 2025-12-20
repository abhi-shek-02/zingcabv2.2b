import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    // { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Corporate', href: '/corporate-booking' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md' 
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group" 
            aria-label="ZingCab Home"
          >
            <div className="relative">
              <img 
                src="/zingcablogo.png" 
                alt="ZingCab Logo" 
                className="h-10 w-auto lg:h-12 transition-transform duration-300 group-hover:scale-110 filter drop-shadow-2xl" 
                width="48" 
                height="48" 
              />
            </div>
            <span className="text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight">
              ZingCab
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 lg:px-4 py-2 text-sm lg:text-base font-semibold rounded-md transition-all duration-300 relative ${
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                )}
                {!isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600/0 hover:bg-blue-600/50 rounded-full transition-all duration-300"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Contact & CTA */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <a
              href="tel:9903042200"
              aria-label="Call ZingCab at 9903042200"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-all duration-300 px-3 py-2 rounded-md"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="font-semibold text-sm lg:text-base">9903042200</span>
            </a>
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 lg:px-6 py-2.5 lg:py-3 rounded-lg transition-all duration-300 font-bold text-sm lg:text-base shadow-lg hover:shadow-xl"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300"
          >
            {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-4 mt-2 border-t border-gray-200">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-semibold rounded-lg transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200">
                <a
                  href="tel:9903042200"
                  aria-label="Call ZingCab at 9903042200"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  <span>9903042200</span>
                </a>
                <Link
                  to="/contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-2 block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-all duration-300 font-bold text-center shadow-lg"
                >
                  Book Now
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;