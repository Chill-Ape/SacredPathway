import React from 'react';
import { Helmet } from 'react-helmet';

export default function StandaloneModelViewer() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-10">
      <Helmet>
        <title>Standalone 3D Burger Viewer | Akashic Archive</title>
        <meta name="description" content="View a 3D burger model using a standalone HTML viewer" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div 
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 cursor-pointer"
          onClick={() => window.location.href = '/ark/artifacts'}
        >
          ← Back to Artifacts
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-8">Standalone 3D Viewer</h1>
        
        <div className="max-w-4xl mx-auto">
          {/* The iframe that will contain our standalone viewer HTML */}
          <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden border border-gray-800 mb-8">
            <iframe 
              src="/model-viewer.html"
              className="w-full h-full"
              title="3D Burger Viewer" 
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/80 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">About This Viewer</h2>
              <p className="text-gray-300 mb-4">
                This is a standalone 3D model viewer that loads directly from an HTML file.
                It uses Three.js loaded from CDN and attempts to find and render the burger model.
              </p>
              
              <p className="text-gray-400 text-sm mt-4">
                If you're seeing a red cube instead of a burger, it means the model file couldn't be located.
              </p>
            </div>
            
            <div className="bg-gray-800/60 rounded-lg p-6 border border-blue-900/30">
              <h3 className="text-xl font-medium text-amber-300 mb-4">Technical Details</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span>Using Three.js r128 from CDN</span>
                </li>
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-green-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span>OrbitControls for camera manipulation</span>
                </li>
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span>GLTFLoader for 3D model loading</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}