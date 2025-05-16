import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';

export default function SimpleBurgerPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  useEffect(() => {
    // Create a simple Three.js scene directly in an isolated iframe
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (iframeDoc) {
        // Create a basic HTML document with Three.js loaded from CDN
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>3D Burger Viewer</title>
            <style>
              body { margin: 0; overflow: hidden; background-color: #000814; }
              canvas { width: 100%; height: 100%; }
              #loading { 
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%);
                color: white;
                font-family: Arial, sans-serif;
                text-align: center;
              }
              .spinner {
                width: 50px;
                height: 50px;
                border: 5px solid rgba(255,255,255,0.1);
                border-radius: 50%;
                border-top-color: #3498db;
                animation: spin 1s ease-in-out infinite;
                margin: 0 auto 15px auto;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
          </head>
          <body>
            <div id="loading">
              <div class="spinner"></div>
              <div>Loading 3D Model...</div>
            </div>
            <script>
              // Initialize the scene, camera, and renderer
              const scene = new THREE.Scene();
              scene.background = new THREE.Color(0x000814);
              
              const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
              camera.position.z = 5;
              
              const renderer = new THREE.WebGLRenderer({ antialias: true });
              renderer.setSize(window.innerWidth, window.innerHeight);
              document.body.appendChild(renderer.domElement);
              
              // Add lighting
              const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
              scene.add(ambientLight);
              
              const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
              directionalLight.position.set(1, 1, 1);
              scene.add(directionalLight);
              
              // Add orbit controls
              const controls = new THREE.OrbitControls(camera, renderer.domElement);
              controls.enableDamping = true;
              controls.dampingFactor = 0.05;
              
              // Create a fallback cube for use if model loading fails
              let fallbackCube = null;
              function addFallbackCube() {
                const geometry = new THREE.BoxGeometry(1, 1, 1);
                const material = new THREE.MeshStandardMaterial({ color: 0xff4500 });
                fallbackCube = new THREE.Mesh(geometry, material);
                scene.add(fallbackCube);
                
                // Hide the loading indicator
                document.getElementById('loading').style.display = 'none';
                
                console.log('All model paths failed, showing fallback cube.');
              }
              
              // Try using fetch to check if the model file exists
              async function fetchModelBlob(url: string) {
                try {
                  const response = await fetch(url);
                  if (!response.ok) {
                    throw new Error("Failed to fetch " + url + ": " + response.status);
                  }
                  const blob = await response.blob();
                  return URL.createObjectURL(blob);
                } catch (error) {
                  console.error("Fetch error:", error);
                  return null;
                }
              }
              
              // Try to load the 3D model
              const loader = new THREE.GLTFLoader();
              
              const modelPaths = [
                '/burger_models/uploads_files_2465920_burger_merged.glb',
                '/burger_models/burger.glb',
                '/basic-models/burger.glb',
                '/burger_model.glb',
                '/3d_burger.glb',
                '/burger_direct.glb',
                '/client/src/assets/3d objects/uploads_files_2465920_burger_merged.glb',
                '/public/burger_models/uploads_files_2465920_burger_merged.glb',
                '/public/3d_burger.glb',
                './burger_models/uploads_files_2465920_burger_merged.glb'
              ];
              
              let currentPathIndex = 0;
              let model = null;
              
              function tryLoadModel() {
                if (currentPathIndex >= modelPaths.length) {
                  console.warn('Failed to load model from all paths, showing fallback');
                  addFallbackCube();
                  return;
                }
                
                const currentPath = modelPaths[currentPathIndex];
                console.log('Trying to load from', currentPath);
                
                loader.load(
                  currentPath,
                  (gltf) => {
                    console.log('Model loaded successfully from', currentPath);
                    
                    model = gltf.scene;
                    scene.add(model);
                    
                    // Center the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.x = -center.x;
                    model.position.y = -center.y;
                    model.position.z = -center.z;
                    
                    // Scale model to fit view
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    if (maxDim > 0) {
                      model.scale.multiplyScalar(2.0 / maxDim);
                    }
                    
                    // Hide the loading indicator
                    document.getElementById('loading').style.display = 'none';
                  },
                  (xhr) => {
                    const progress = (xhr.loaded / xhr.total) * 100;
                    console.log(currentPath + ': ' + progress.toFixed(2) + '% loaded');
                  },
                  (error) => {
                    console.error('Error loading from ' + currentPath, error);
                    currentPathIndex++;
                    tryLoadModel();
                  }
                );
              }
              
              // Start loading the model
              tryLoadModel();
              
              // Animation loop
              function animate() {
                requestAnimationFrame(animate);
                
                if (fallbackCube) {
                  fallbackCube.rotation.x += 0.01;
                  fallbackCube.rotation.y += 0.01;
                }
                
                controls.update();
                renderer.render(scene, camera);
              }
              animate();
              
              // Handle window resize
              window.addEventListener('resize', () => {
                const width = window.innerWidth;
                const height = window.innerHeight;
                
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
              });
            </script>
          </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-10">
      <Helmet>
        <title>Simple Burger Viewer | Akashic Archive</title>
        <meta name="description" content="View a 3D burger model in an isolated iframe" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6 cursor-pointer" 
             onClick={() => window.location.href = '/ark/artifacts'}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Artifacts
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-8">Simple Burger 3D Viewer</h1>
        
        <div className="max-w-4xl mx-auto">
          {/* The iframe that will contain our Three.js scene */}
          <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden border border-gray-800 mb-8">
            <iframe 
              ref={iframeRef}
              className="w-full h-full"
              title="3D Burger Viewer" 
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/80 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">About This Viewer</h2>
              <p className="text-gray-300 mb-4">
                This is an isolated 3D model viewer running Three.js in an iframe. 
                It attempts to load the burger model from multiple possible locations.
              </p>
              
              <p className="text-gray-400 text-sm">
                If the model fails to load, a simple rotating cube will be displayed as a fallback.
              </p>
            </div>
            
            <div className="bg-gray-800/60 rounded-lg p-6 border border-blue-900/30">
              <h3 className="text-xl font-medium text-amber-300 mb-4">Controls</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span><strong>Rotate:</strong> Click and drag to rotate</span>
                </li>
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-green-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span><strong>Zoom:</strong> Scroll to zoom in/out</span>
                </li>
                <li className="flex items-start">
                  <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 mr-3 flex-shrink-0"></div>
                  <span><strong>Pan:</strong> Right-click and drag</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}