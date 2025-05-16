import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';

export default function ViewerNavPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-12">
      <Helmet>
        <title>3D Viewer Test Pages | Akashic Archive</title>
        <meta name="description" content="Navigation for 3D model viewer test pages" />
      </Helmet>
      
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/">
            <a className="text-blue-400 hover:text-blue-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </a>
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">3D Viewer Test Pages</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Select one of the viewer implementations below to test the 3D burger model rendering.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <ViewerCard 
            title="Standalone HTML Viewer" 
            description="Pure HTML/JS viewer isolated in an iframe. Uses Three.js loaded from CDN."
            path="/standalone-model"
            color="blue"
          />
          
          <ViewerCard 
            title="Simple Iframe Viewer" 
            description="React component wrapping an iframe with embedded Three.js code."
            path="/simple-burger"
            color="indigo"
          />
          
          <ViewerCard 
            title="Basic Three.js Viewer" 
            description="React component using direct Three.js imports without React Three Fiber."
            path="/basic-burger"
            color="green"
          />
          
          <ViewerCard 
            title="React Three Fiber" 
            description="Model viewer using React Three Fiber and Drei helpers."
            path="/burger-model"
            color="amber"
          />
        </div>
        
        <div className="mt-16 bg-gray-800/60 p-6 rounded-lg max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          
          <div className="space-y-4 text-gray-300">
            <p>
              Each viewer implementation attempts to load the burger 3D model (GLB file) from multiple possible locations:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><code className="bg-gray-700 px-1 rounded">/burger_models/uploads_files_2465920_burger_merged.glb</code></li>
              <li><code className="bg-gray-700 px-1 rounded">/3d_burger.glb</code></li>
              <li><code className="bg-gray-700 px-1 rounded">/burger_model.glb</code></li>
              <li><code className="bg-gray-700 px-1 rounded">/public/burger_models/uploads_files_2465920_burger_merged.glb</code></li>
              <li><code className="bg-gray-700 px-1 rounded">/client/src/assets/3d objects/uploads_files_2465920_burger_merged.glb</code></li>
            </ul>
            
            <p>
              If the model fails to load from any location, a colored fallback cube will be displayed instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for viewer cards
function ViewerCard({ 
  title, 
  description, 
  path,
  color 
}: { 
  title: string; 
  description: string; 
  path: string;
  color: 'blue' | 'indigo' | 'green' | 'amber';
}) {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 border-blue-500",
    indigo: "bg-indigo-600 hover:bg-indigo-700 border-indigo-500",
    green: "bg-green-600 hover:bg-green-700 border-green-500",
    amber: "bg-amber-600 hover:bg-amber-700 border-amber-500"
  };
  
  return (
    <Link href={path}>
      <a className={`block h-full ${colorClasses[color]} text-white p-6 rounded-lg border-b-4 transition-transform hover:translate-y-[-4px]`}>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
        <div className="mt-4 text-right">
          <span className="inline-flex items-center text-sm font-medium">
            View
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </a>
    </Link>
  );
}