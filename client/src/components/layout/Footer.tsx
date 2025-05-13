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
    { name: "Sacred Scrolls", path: "/scrolls" },
    { name: "Ancient Lore", path: "/lore" },
    { name: "The Oracle", path: "/oracle" },
    { name: "Contact", path: "/contact" },
  ];
  
  const resourceLinks = [
    { name: "Beginner's Guide", path: "/scrolls" },
    { name: "Meditation Practices", path: "/scrolls" },
    { name: "Sacred Symbolism", path: "/lore" },
    { name: "Keeper's Journal", path: "/lore" },
    { name: "Sacred Geometry", path: "/scrolls" },
  ];

  return (
    <footer className="bg-sacred-blue text-sacred-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Logo inverted className="mr-3" />
              <span className="text-xl font-cinzel">The Akashic Archive</span>
            </div>
            <p className="font-raleway text-sacred-white/80 text-sm">
              A repository of timeless wisdom connecting past, present, and future through the sacred teachings preserved since the dawn of consciousness.
            </p>
          </div>
          
          <div>
            <h4 className="font-cinzel text-lg mb-4">Navigation</h4>
            <ul className="font-raleway space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link href={link.path}>
                    <span className="hover:text-sacred-gold transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-cinzel text-lg mb-4">Resources</h4>
            <ul className="font-raleway space-y-2">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.path}>
                    <span className="hover:text-sacred-gold transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-cinzel text-lg mb-4">Newsletter</h4>
            <p className="font-raleway text-sacred-white/80 text-sm mb-3">
              Receive wisdom directly to your consciousness. Subscribe to our ethereal newsletter.
            </p>
            <form onSubmit={handleSubscribe} className="flex">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-sacred-blue-dark border-sacred-white/30 rounded-r-none text-sacred-white placeholder:text-sacred-white/50 focus:ring-sacred-gold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-sacred-gold hover:bg-sacred-gold/80 text-sacred-blue font-cinzel tracking-wide rounded-l-none text-sm transition-colors duration-300"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-sacred-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-raleway text-sacred-white/70 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} The Akashic Archive. All rights reserved. Founded in the Fourth Cycle.
          </p>
          <div className="flex space-x-6 text-sacred-white/70">
            <Link href="/privacy">
              <span className="text-sm hover:text-sacred-white transition-colors cursor-pointer">Privacy Policy</span>
            </Link>
            <Link href="/terms">
              <span className="text-sm hover:text-sacred-white transition-colors cursor-pointer">Terms of Service</span>
            </Link>
            <Link href="/accessibility">
              <span className="text-sm hover:text-sacred-white transition-colors cursor-pointer">Accessibility</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
