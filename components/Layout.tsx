
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { NAV_LINKS, APP_CONFIG } from '../constants';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  lang: Language;
  setLang: (lang: Language) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, lang, setLang }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleLang = () => setLang(lang === 'en' ? 'jp' : 'en');

  return (
    <div className="min-h-screen flex flex-col font-sans text-mncc-text bg-mncc-bg selection:bg-mncc-primary selection:text-white">
      {/* Navigation - Organic Paper Style */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-[#f3f1ea]/90 backdrop-blur-xl border-b border-black/5 shadow-sm' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="relative w-8 h-8 rounded-lg bg-mncc-primary flex items-center justify-center text-white font-bold shadow-md group-hover:bg-mncc-text transition-colors duration-300">
                Z
              </div>
              <span className={`font-semibold tracking-tight text-lg ${scrolled ? 'text-mncc-text' : 'text-mncc-text'}`}>ZipAI</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {NAV_LINKS.map((link) => {
                   const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                   return (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 overflow-hidden group ${
                        isActive 
                            ? 'text-mncc-primary bg-mncc-primary/10 font-semibold' 
                            : 'text-mncc-muted hover:text-mncc-text hover:bg-black/5'
                        }`}
                    >
                        <span className="relative z-10">{link.label[lang]}</span>
                        {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-mncc-primary"></div>}
                    </Link>
                   )
                })}
                <button 
                  onClick={toggleLang}
                  className="ml-4 flex items-center gap-1 text-xs border border-black/10 bg-white/50 hover:bg-white/80 rounded-full px-3 py-1 transition-colors text-mncc-text"
                >
                  <Globe size={12} />
                  {lang === 'en' ? 'JP' : 'EN'}
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-mncc-text hover:bg-black/5 focus:outline-none"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-mncc-bg border-b border-black/5 animate-fade-in-down shadow-xl">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'text-mncc-primary bg-mncc-primary/10'
                      : 'text-mncc-text hover:bg-black/5'
                  }`}
                >
                  {link.label[lang]}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-mncc-text mb-2 flex items-center gap-2">
                 <div className="w-4 h-4 bg-mncc-primary rounded-full"></div>
                 Zip Your PotentIAl
              </h3>
              <p className="text-sm text-mncc-muted pl-6">Cambridge, MA, USA</p>
            </div>
            <div className="md:text-right space-x-6">
                <a href={APP_CONFIG.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-mncc-muted hover:text-mncc-primary transition-colors">Twitter</a>
                <a href={APP_CONFIG.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-mncc-muted hover:text-mncc-primary transition-colors">GitHub</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-black/5">
            <p className="text-center text-mncc-muted text-xs mt-6">
              &copy; {new Date().getFullYear()} ZipAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
