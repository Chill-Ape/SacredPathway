import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import Logo from "@/components/ui/Logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  
  // State to keep track of whether user was authenticated previously
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  
  // When authentication changes, update wasAuthenticated status
  useEffect(() => {
    if (user) {
      setWasAuthenticated(true);
    }
  }, [user]);
  
  // Reset wasAuthenticated on explicit logout
  const handleLogout = () => {
    setWasAuthenticated(false);
  };
  
  // Debug
  console.log("Navbar - User:", user, "Was authenticated:", wasAuthenticated);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Ark Contents", path: "/ark-contents" },
    { name: "Akashic Lore", path: "/lore" },
    { name: "The Oracle", path: "/oracle" },
    { name: "The Simulation", path: "/simulation" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sacred-white bg-opacity-90 backdrop-blur-sm border-b border-sacred-blue/10 font-cinzel tracking-wider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <div className="flex items-center cursor-pointer">
                <Logo className="mr-4" />
                <span className="text-sacred-blue text-xl font-medium">The Akashic Archive</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8 text-sacred-blue text-sm">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <span className={`font-cinzel hover:text-sacred-blue-light transition-colors duration-300 cursor-pointer ${location === link.path ? 'text-sacred-blue font-medium' : 'text-sacred-gray'}`}>
                  {link.name}
                </span>
              </Link>
            ))}
            <ProfileMenu 
              forcedUser={user}
              wasAuthenticated={wasAuthenticated}
              onLogout={handleLogout}
            />
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
                <Link key={link.path} to={link.path}>
                  <span 
                    className={`block w-full py-2 font-cinzel hover:bg-sacred-blue/5 rounded transition-colors duration-300 cursor-pointer ${location === link.path ? 'text-sacred-blue font-medium' : 'text-sacred-gray'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
              
              {/* Login/Profile button in mobile menu */}
              <div className="py-3 border-t border-sacred-blue/10 mt-3">
                <div className="flex justify-center" onClick={() => setIsMobileMenuOpen(false)}>
                  {!isLoading && <ProfileMenu 
                    isMobile={true} 
                    forcedUser={user} 
                    wasAuthenticated={wasAuthenticated}
                    onLogout={handleLogout} 
                  />}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
