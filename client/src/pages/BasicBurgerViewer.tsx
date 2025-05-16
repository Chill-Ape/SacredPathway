import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { ChevronLeft } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function BasicBurgerViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // --- SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    
    // --- SETUP CAMERA ---
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    
    // --- SETUP RENDERER ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // --- SETUP LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // --- SETUP CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // --- LOAD 3D MODEL ---
    let model: THREE.Group | null = null;
    const modelPaths = [
      '/basic-models/burger.glb',
      '/burger_model.glb',
      '/3d_burger.glb',
      '/burger_direct.glb'
    ];
    
    let loadingTextMesh: THREE.Mesh | null = null;
    
    // Add loading indicator - simpler approach with a spinning cube
    const addLoadingText = () => {
      // Create a simple spinning cube as loading indicator
      const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const material = new THREE.MeshStandardMaterial({ color: 0x3498db });
      loadingTextMesh = new THREE.Mesh(geometry, material);
      scene.add(loadingTextMesh);
      
      // Add animation for loading indicator
      const animateLoading = () => {
        if (loadingTextMesh) {
          loadingTextMesh.rotation.x += 0.02;
          loadingTextMesh.rotation.y += 0.02;
          loadingTextMesh.rotation.z += 0.01;
        }
        
        renderer.render(scene, camera);
        
        // Continue animation until model is loaded
        if (!model) {
          requestAnimationFrame(animateLoading);
        }
      };
      
      animateLoading();
    };
    
    // Attempt to load fallback cube if model loading fails
    const addFallbackCube = () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0xff4500 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      // Animation function for the cube
      const animateCube = () => {
        if (cube) {
          cube.rotation.x += 0.01;
          cube.rotation.y += 0.01;
        }
      };
      
      return { cube, animateCube };
    };
    
    // Function to try loading from different paths
    const tryLoadModels = (pathIndex = 0) => {
      if (pathIndex >= modelPaths.length) {
        console.log('Failed to load model from all paths');
        // Show a fallback cube if we've tried all paths
        const { cube, animateCube } = addFallbackCube();
        
        // Update the animation function to include cube rotation
        const animate = () => {
          requestAnimationFrame(animate);
          animateCube();
          controls.update();
          renderer.render(scene, camera);
        };
        animate();
        return;
      }
      
      const currentPath = modelPaths[pathIndex];
      console.log(`Trying to load model from: ${currentPath}`);
      
      const loader = new GLTFLoader();
      loader.load(
        currentPath,
        (gltf: { scene: THREE.Group }) => {
          console.log(`Successfully loaded model from ${currentPath}`);
          
          // Remove loading text if present
          if (loadingTextMesh) {
            scene.remove(loadingTextMesh);
          }
          
          model = gltf.scene;
          scene.add(model);
          
          // Center the model
          if (model) {
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
          }
          
          // Simple animation function
          const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
          };
          animate();
        },
        (xhr: { loaded: number; total: number }) => {
          const progress = (xhr.loaded / xhr.total) * 100;
          console.log(`${currentPath}: ${progress.toFixed(1)}% loaded`);
        },
        (error: Error) => {
          console.error(`Failed to load from ${currentPath}:`, error);
          // Try the next path
          tryLoadModels(pathIndex + 1);
        }
      );
    };
    
    // Show loading text and start loading models
    addLoadingText();
    tryLoadModels();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up 3D viewer');
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
      
      // Dispose of resources
      if (model) {
        scene.remove(model);
      }
      
      controls.dispose();
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-10">
      <Helmet>
        <title>Basic Burger Viewer | Akashic Archive</title>
        <meta name="description" content="View a 3D burger model using simple Three.js" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/ark/artifacts">
          <a className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Artifacts
          </a>
        </Link>
        
        <h1 className="text-3xl font-bold text-center text-white mb-8">Basic Burger 3D Viewer</h1>
        
        <div className="max-w-4xl mx-auto">
          {/* 3D Viewer Container */}
          <div 
            ref={containerRef} 
            className="w-full h-[500px] bg-black rounded-lg overflow-hidden border border-gray-800 mb-8"
          />
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/80 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">About This Viewer</h2>
              <p className="text-gray-300 mb-4">
                This is a minimal 3D model viewer using direct Three.js integration 
                without React Three Fiber. It attempts to load the burger model from multiple 
                possible locations.
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