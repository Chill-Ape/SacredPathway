import { useState } from "react";
import { Link, useLocation } from "wouter";
import Logo from "@/components/ui/Logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Scrolls", path: "/scrolls" },
    { name: "Lore", path: "/lore" },
    { name: "Oracle", path: "/oracle" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sacred-white bg-opacity-90 backdrop-blur-sm border-b border-sacred-blue/10 font-cinzel tracking-wider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <div className="flex items-center">
                <Logo className="mr-4" />
                <span className="text-sacred-blue text-xl font-medium">The Sacred Archive</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8 text-sacred-blue text-sm">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <span className={`font-cinzel hover:text-sacred-blue-light transition-colors duration-300 cursor-pointer ${location === link.path ? 'text-sacred-blue font-medium' : 'text-sacred-gray'}`}>
                  {link.name}
                </span>
              </Link>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMobileMenu}
              className="text-sacred-blue hover:bg-sacred-blue/5"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-sacred-white border-b border-sacred-blue/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 font-cinzel text-center">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <span 
                    className={`block w-full py-2 font-cinzel hover:bg-sacred-blue/5 rounded transition-colors duration-300 cursor-pointer ${location === link.path ? 'text-sacred-blue font-medium' : 'text-sacred-gray'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
