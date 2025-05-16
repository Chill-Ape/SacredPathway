import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import ImportModelViewer from '@/components/artifacts/ImportModelViewer';
import { ChevronLeft } from 'lucide-react';

export default function BurgerArtifact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pb-16">
      <Helmet>
        <title>Ancient Artifact | Akashic Archive</title>
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
            <ImportModelViewer />
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold text-blue-300 mb-4">Ancient Relic</h2>
              <p className="text-gray-300 mb-4">
                This mysterious artifact appears to have origins dating back to a time before recorded history. Scholars believe it may have been part of a ceremonial practice, although its true purpose remains unknown.
              </p>
              <div className="space-y-3 mt-6">
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-gray-200">Unknown</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Material:</span>
                  <span className="text-gray-200">Crystal, Unknown Metals</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-400">Origin:</span>
                  <span className="text-gray-200">Pre-Deluge</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-400">Energy Signature:</span>
                  <span className="text-gray-200">Active</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/60 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-xl font-medium text-amber-300 mb-3">Artifact Notes</h3>
              <p className="text-gray-300 italic text-sm mb-4">
                "The artifact demonstrates properties that defy conventional explanation. When exposed to certain frequencies, it emits a soft blue glow and appears to alter the local electromagnetic field. Further research is needed."
              </p>
              <p className="text-right text-gray-400 text-sm">- Keeper's Journal, Entry 147</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}