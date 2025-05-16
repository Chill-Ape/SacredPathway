import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import BasicBurgerViewer from '@/components/artifacts/BasicBurgerViewer';
import { ChevronLeft } from 'lucide-react';

export default function FinalArtifact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 pb-16">
      <Helmet>
        <title>Burger 3D Model | Akashic Archive</title>
        <meta name="description" content="Interactive 3D burger model demonstrating model loading capabilities" />
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
            <BasicBurgerViewer />
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800/90 rounded-lg p-6 border border-gray-700/50">
              <h2 className="text-2xl font-semibold text-blue-300 mb-4">3D Burger Model</h2>
              <p className="text-gray-300 mb-4">
                This is a 3D model of a burger loaded directly from a GLB file. The model demonstrates our ability to render real 3D models within the application.
              </p>
              <div className="space-y-3 mt-6">
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">File Format:</span>
                  <span className="text-gray-200">GLB (3D)</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Path:</span>
                  <span className="text-gray-200 text-sm">/burger_models/uploads_files_2465920_burger_merged.glb</span>
                </div>
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Renderer:</span>
                  <span className="text-gray-200">React Three Fiber / Three.js</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-gray-400">Interactions:</span>
                  <span className="text-amber-300">Rotate, Zoom</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/60 rounded-lg p-6 border border-blue-900/30">
              <h3 className="text-xl font-medium text-amber-300 mb-3">3D Model Interactions</h3>
              <p className="text-gray-300 mb-4">
                You can interact with the 3D model using the following controls:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Click and drag to rotate the model</li>
                <li>• Scroll to zoom in and out</li>
                <li>• Right-click and drag to pan</li>
              </ul>
            </div>
            
            <div className="bg-gray-900/90 rounded-lg p-6 border border-amber-900/30">
              <h3 className="text-lg font-medium text-amber-400 mb-3">Technical Information</h3>
              <p className="text-gray-300 mb-3">The 3D burger model is rendered using:</p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mr-3"></div>
                  <span>React Three Fiber for React integration</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mr-3"></div>
                  <span>Drei for orbit controls and helpers</span>
                </li>
                <li className="flex items-center text-gray-300">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-3"></div>
                  <span>Three.js for 3D rendering</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}