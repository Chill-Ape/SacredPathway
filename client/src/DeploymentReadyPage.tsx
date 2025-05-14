import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import WelcomeModal from '@/components/mana/WelcomeModal';

// This is a simplified landing page for successful deployment
// It's designed to be lightweight and deploy easily
const DeploymentReadyPage = () => {
  // Simple animation effect for the glow
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  useEffect(() => {
    // Create a pulsing glow effect
    const interval = setInterval(() => {
      setGlowIntensity((prev) => {
        const newValue = prev + 0.02;
        return newValue > 1 ? 0 : newValue;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-900 text-amber-100 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <Helmet>
        <title>Akashic Archive | Deployment Successful</title>
        <meta name="description" content="The Akashic Archive has been successfully deployed." />
      </Helmet>
      
      {/* Background glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-amber-500/5 to-transparent rounded-full blur-3xl"
        style={{
          opacity: 0.3 + glowIntensity * 0.2,
          transform: `scale(${1 + glowIntensity * 0.2})`,
          transition: 'opacity 0.5s, transform 0.5s',
        }}
      />
      
      <div className="max-w-xl w-full bg-slate-800/50 backdrop-blur-md p-8 rounded-lg border border-amber-600/30 shadow-lg relative z-10">
        <h1 className="text-3xl font-bold text-center mb-6 text-amber-400">
          Akashic Archive Deployment Successful
        </h1>
        
        <div className="space-y-4 mb-8">
          <p className="text-amber-100/80">
            The gateway to ancient knowledge has been successfully deployed. Access to the complete Archive is now available.
          </p>
          
          <p className="text-amber-100/80">
            The Akashic Archive contains fragments of ancient wisdom, sacred tablets, scrolls, and artifacts waiting to be explored.
          </p>
          
          <div className="mt-8 border-t border-amber-600/20 pt-6">
            <h2 className="text-xl font-semibold mb-3 text-amber-300">Key Features Available:</h2>
            <ul className="space-y-2 text-amber-100/70">
              <li>• Interactive Test Homepage with animated elements</li>
              <li>• Oracle consultation with ancient wisdom</li>
              <li>• Sacred scrolls and tablet galleries</li>
              <li>• Mana-based currency system</li>
              <li>• User authentication and profile system</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <a 
            href="/test"
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-amber-100 rounded-md font-medium shadow-md transition-colors"
          >
            Enter The Archive
          </a>
          <a 
            href="/"
            className="ml-4 px-5 py-2.5 bg-transparent border border-amber-500 hover:bg-amber-500/10 text-amber-100 rounded-md font-medium shadow-md transition-colors"
          >
            Return to Homepage
          </a>
        </div>
      </div>
      
      <p className="mt-8 text-amber-500/60 text-sm">Deployment timestamp: {new Date().toLocaleString()}</p>
      
      {/* Test button for the welcome modal */}
      <div className="mt-4">
        <button 
          onClick={() => setShowWelcomeModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
        >
          Test Mobile Welcome Modal
        </button>
      </div>
      
      {/* Welcome modal component for testing */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
        username="Test User" 
      />
    </div>
  );
};

export default DeploymentReadyPage;