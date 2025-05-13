import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { Sparkles, Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

const Simulation: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>The Simulation | Akashic Archive</title>
        <meta 
          name="description" 
          content="Enter the Simulation - a real-time memory interface where seekers can farm or gather Mana through sacred rituals, quests, or trials." 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
        {/* Decorative background elements - ancient glyphs */}
        <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 border border-blue-300 rounded-full"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 border border-yellow-400 rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-purple-400 rounded-full"></div>
          {/* Sacred geometry patterns */}
          <div className="grid grid-cols-10 gap-10 absolute inset-0">
            {Array(100).fill(0).map((_, i) => (
              <div key={i} className="h-2 w-2 bg-blue-400 rounded-full opacity-30"></div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Return to Archive link */}
          <div className="mb-8">
            <Link href="/oracle" className="inline-flex items-center text-blue-300 hover:text-blue-100 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Archive
            </Link>
          </div>

          {/* Main content */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-300 to-yellow-300 mb-6">
                The Simulation
              </h1>
              
              {/* Mana balance if user is logged in */}
              {user && (
                <div className="inline-flex items-center px-4 py-2 bg-blue-900/30 border border-blue-400 rounded-full text-blue-200 mb-6">
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-300" />
                  Current Mana: <span className="font-bold ml-2">{(user as any).manaBalance || 0}</span>
                </div>
              )}
            </div>

            {/* Introduction section */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-10 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-blue-200 mb-4">Welcome to the Simulation</h2>
              <p className="text-blue-100 leading-relaxed mb-4">
                This Simulation is the result of decoding an ancient artifact recovered from within the Ark. 
                What you see is only a partial rendering — the artifact's code is of fifth-dimensional origin, 
                and cannot yet be fully interpreted by current three-dimensional systems.
              </p>
              <p className="text-blue-100 leading-relaxed">
                To make it accessible, we have projected its essence into a 2D experience. The decoding is ongoing. 
                As more of the artifact reveals itself, the Simulation will evolve — unlocking new realms, quests, 
                and sacred memory fragments.
              </p>
            </div>

            {/* What is The Simulation section */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-10 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-blue-200 mb-4">What is the Simulation?</h2>
              <p className="text-blue-100 leading-relaxed">
                The Simulation is a real-time memory interface — a world where seekers can farm or gather Mana 
                through sacred rituals, quests, or trials.
              </p>
              <p className="text-blue-100 leading-relaxed mt-4">
                Earned Mana can be imported to your Akashic Archive account, where it becomes currency for 
                unlocking scrolls, books, and deeper knowledge.
              </p>
            </div>

            {/* How It Works section */}
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6 mb-10 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-blue-200 mb-4">How It Works</h2>
              <ul className="text-blue-100 space-y-2">
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">•</span>
                  <span>Farm Mana through simulated rituals, quests, and puzzles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">•</span>
                  <span>Sync your Mana back to your profile in the Archive</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-300 mr-2">•</span>
                  <span>Spend Mana to unlock higher-tier knowledge, rare scrolls, or Oracle responses</span>
                </li>
              </ul>
            </div>

            {/* Early Access Notice */}
            <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-6 mb-10 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-purple-300 mr-2" />
                <h2 className="text-2xl font-semibold text-purple-200">Early Access Notice</h2>
              </div>
              <p className="text-purple-100 leading-relaxed mb-4">
                The Simulation is currently in early access. New regions, rituals, and quests are added regularly. 
                Your feedback helps shape the future.
              </p>
              <p className="text-purple-100 font-semibold italic">
                This world is being written in real time.
              </p>
            </div>

            {/* Coming Soon Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-xl font-medium text-gray-300 mb-2">Ritual Chambers</h3>
                <div className="inline-block px-3 py-1 bg-gray-800 rounded-full text-xs text-yellow-300">
                  COMING SOON
                </div>
              </div>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-center">
                <h3 className="text-xl font-medium text-gray-300 mb-2">Quest Scroll Generator</h3>
                <div className="inline-block px-3 py-1 bg-gray-800 rounded-full text-xs text-yellow-300">
                  COMING SOON
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
              <Button 
                className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6"
              >
                Begin Simulation
                <Sparkles className="ml-2 h-5 w-5 text-yellow-200" />
              </Button>
              
              <Link href="/scrolls">
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto border-blue-400 text-blue-200 hover:bg-blue-900/30 text-lg px-8 py-6"
                >
                  Return to Archive
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Simulation;