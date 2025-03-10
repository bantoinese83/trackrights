'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  LayoutList,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { jsonLdScriptProps } from 'react-schemaorg';
import { InfiniteCarousel } from './InfiniteCarousel';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (sectionId: string) => {
    if (pathname === '/') {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleRouteChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setTimeout(() => {
          const section = document.getElementById(hash);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          }
        }, 0);
      }
    };

    handleRouteChange();
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY) {
          // if scroll down hide the navbar
          setIsVisible(false);
        } else {
          // if scroll up show the navbar
          setIsVisible(true);
        }

        // remember current page location to use in the next move
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);

      // cleanup function
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    ...(pathname !== '/'
      ? [
          {
            name:
              pathname.split('/')[1].charAt(0).toUpperCase() +
              pathname.split('/')[1].slice(1),
            url: pathname,
          },
        ]
      : []),
  ];

  return (
    <header
      className={`fixed w-full z-50 text-white transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900">
        <div className="container mx-auto">
          <InfiniteCarousel />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-blue-900/90 border-b border-purple-300/20 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-6">
            <Link href="/" className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-1">
                  <span
                    className="text-4xl sm:text-5xl font-normal"
                    style={{
                      fontFamily: 'var(--font-decorative)',
                    }}
                  >
                    T
                  </span>
                  <span
                    className="text-4xl sm:text-5xl font-normal transform scale-x-[-1]"
                    style={{
                      fontFamily: 'var(--font-decorative)',
                      display: 'inline-block',
                    }}
                  >
                    R
                  </span>
                </div>
                <span className="text-sm font-semibold text-purple-200 mt-1">
                  TrackRights
                </span>
              </div>
              <span className="hidden sm:inline-block ml-2 text-sm font-semibold text-purple-200">
                AI-Powered Music Contract Analysis for All Industry
                Professionals
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-sm hover:text-purple-200 flex items-center font-sans"
              >
                <Home className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Home</span>
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm hover:text-purple-200 flex items-center font-sans"
              >
                <LayoutList className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Features</span>
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-sm hover:text-purple-200 flex items-center font-sans"
              >
                <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Testimonials</span>
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-sm hover:text-purple-200 flex items-center font-sans"
              >
                <HelpCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>FAQ</span>
              </button>
            </nav>
            <div className="hidden md:block"></div>
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="https://x.com/trackrights"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/trackrights"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
            <button
              className="md:hidden p-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-purple-950/80 backdrop-blur-md">
          <nav className="flex flex-col space-y-4 p-4">
            <Link
              href="/"
              className="text-white hover:text-purple-200 flex items-center font-sans"
            >
              <Home className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Home</span>
            </Link>
            <button
              onClick={() => scrollToSection('features')}
              className="text-white hover:text-purple-200 text-left flex items-center font-sans"
            >
              <LayoutList className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Features</span>
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-white hover:text-purple-200 text-left flex items-center font-sans"
            >
              <MessageCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>Testimonials</span>
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-white hover:text-purple-200 text-left flex items-center font-sans"
            >
              <HelpCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              <span>FAQ</span>
            </button>
          </nav>
        </div>
      )}

      <script
        {...jsonLdScriptProps({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://trackrights.com${item.url}`,
          })),
        })}
      />
      <style jsx>{`
        :root {
          --font-sans: 'Butler', 'Montserrat', -apple-system,
            BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
            sans-serif;
          --font-decorative: ${'Salome, Langita, Astila, cursive'};
        }

        header {
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
      <style jsx>{`
        @supports (backdrop-filter: blur(8px)) {
        }
      `}</style>
    </header>
  );
}
