import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import SimpleModelViewer from '@/components/artifacts/SimpleModelViewer';
import { ChevronLeft } from 'lucide-react';

export default function FinalArtifact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pb-16">
      <Helmet>
        <title>Mystical Artifact | Akashic Archive</title>
        <meta name="description" content="Explore the ancient artifact with interactive 3D viewing capabilities" />
      </Helmet>
      
      <div className="container mx-auto px-4 pt-8">
        <Link href="/ark/artifacts">
          <a className="flex items-center text-blue-400 hover:text-blue-300 mb-6 transition">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Artifacts
          </a>
        </Link>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <SimpleModelViewer />
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/90 rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-2xl font-semibold text-blue-300 mb-4">The Mysterious Crystal Artifact</h2>
              <p className="text-gray-300 mb-4">
                This extraordinary artifact defies conventional understanding. It appears to be a complex crystalline structure with embedded metallic components that scholars believe served as an advanced computational device.
              </p>
              <div className="space-y-3 mt-6">
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-gray-200">Estimated 12,000+ years</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Material:</span>
                  <span className="text-gray-200">Unknown Crystal, Rare Metals</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Origin:</span>
                  <span className="text-gray-200">Pre-Deluge Civilization</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-400">Energy Signature:</span>
                  <span className="text-amber-300">Active</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/60 rounded-lg p-6 border border-blue-900/30">
              <h3 className="text-xl font-medium text-amber-300 mb-3">Keeper's Notes</h3>
              <p className="text-gray-300 italic text-sm mb-4">
                "The artifact demonstrates properties that defy conventional explanation. When exposed to certain frequencies, it emits a soft blue glow and appears to alter the local electromagnetic field. Several researchers have reported unusual dreams after prolonged exposure."
              </p>
              <p className="text-right text-gray-400 text-sm">- The Keeper, Entry 147</p>
            </div>
            
            <div className="bg-gray-900/90 rounded-lg p-6 border border-amber-900/30">
              <h3 className="text-lg font-medium text-amber-400 mb-3">Interaction Points</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mr-3"></div>
                  <span>Central crystal matrix - primary data core</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mr-3"></div>
                  <span>Outer nodes - energy collection points</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-3"></div>
                  <span>Base platform - stabilizing mechanism</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}