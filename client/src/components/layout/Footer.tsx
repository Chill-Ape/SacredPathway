import { Link } from "wouter";
import Logo from "@/components/ui/Logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ 
        title: "Error",
        description: "Please enter a valid email address", 
        variant: "destructive" 
      });
      return;
    }
    
    toast({ 
      title: "Thank you",
      description: "You have been subscribed to our newsletter", 
    });
    setEmail("");
  };
  
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Ark Contents", path: "/scrolls" },
    { name: "Akashic Lore", path: "/lore" },
    { name: "The Oracle", path: "/oracle" },
    { name: "Contact", path: "/contact" },
  ];
  
  const resourceLinks = [
    { name: "Beginner's Guide", path: "/scrolls" },
    { name: "Meditation Practices", path: "/scrolls" },
    { name: "Akashic Symbolism", path: "/lore" },
    { name: "Keeper's Journal", path: "/lore" },
    { name: "Akashic Geometry", path: "/scrolls" },
  ];

  return (
    <footer className="bg-white border-t border-theme-gold/10 pt-12 pb-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Elegant divider with gold accent */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px bg-theme-gold/30 flex-grow"></div>
          <div className="mx-4">
            <svg width="24" height="24" viewBox="0 0 100 100" className="text-theme-gold">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
          </div>
          <div className="h-px bg-theme-gold/30 flex-grow"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Logo className="mr-3" />
              <span className="text-xl font-cinzel text-theme-text-dark">The Akashic Archive</span>
            </div>
            <p className="text-theme-text-secondary text-sm">
              A repository of timeless wisdom connecting past, present, and future through the sacred teachings preserved since the dawn of consciousness.
            </p>
          </div>
          
          <div>
            <h4 className="font-cinzel text-lg mb-4 text-theme-text-dark border-b border-theme-gold/20 pb-2">Navigation</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>
                    <span className="text-theme-text-primary hover:text-theme-gold transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-cinzel text-lg mb-4 text-theme-text-dark border-b border-theme-gold/20 pb-2">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.path}>
                    <span className="text-theme-text-primary hover:text-theme-gold transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-cinzel text-lg mb-4 text-theme-text-dark border-b border-theme-gold/20 pb-2">Newsletter</h4>
            <p className="text-theme-text-secondary text-sm mb-3">
              Receive wisdom directly to your consciousness. Subscribe to our newsletter.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white border-theme-gold/30 rounded-r-none text-theme-text-primary placeholder:text-theme-text-light focus:ring-theme-gold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-theme-gold hover:bg-theme-gold-dark text-white font-cinzel tracking-wide rounded-l-none text-sm transition-colors duration-300"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-theme-gold/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-theme-text-light text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} The Akashic Archive. All rights reserved. Founded in the Fourth Cycle.
          </p>
          <div className="flex space-x-6 text-theme-text-light">
            <Link href="/privacy">
              <span className="text-sm hover:text-theme-gold transition-colors cursor-pointer">Privacy Policy</span>
            </Link>
            <Link href="/terms">
              <span className="text-sm hover:text-theme-gold transition-colors cursor-pointer">Terms of Service</span>
            </Link>
            <Link href="/accessibility">
              <span className="text-sm hover:text-theme-gold transition-colors cursor-pointer">Accessibility</span>
            </Link>
            <Link href="/deploy">
              <span className="text-sm hover:text-theme-gold transition-colors cursor-pointer">Deployment</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
