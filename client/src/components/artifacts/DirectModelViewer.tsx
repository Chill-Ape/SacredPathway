import React, { useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface DirectModelViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

export default function DirectModelViewer({ isUnlocked, onHotspotClick }: DirectModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelStats, setModelStats] = useState<string | null>(null);

  // Define our model paths to try - prioritize the new custom artifact model
  const modelPaths = [
    '/assets/3d_objects/custom_artifact.glb', // Custom artifact model (burger_merged)
    '/assets/3d_objects/3d_artifact.glb',     // Original path
    '/3d_artifact.glb',                       // Other possible locations
    '/models/3d_artifact.glb',
    '/cgtrader/model.glb',
    '/artifacts/3d_artifact.glb',
    '/files/3d_artifact.glb'
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    
    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let mixer: THREE.AnimationMixer | null = null;
    let clock = new THREE.Clock();
    let animationId: number;
    
    // Initialize Three.js
    const init = () => {
      const container = containerRef.current!;
      
      // Create scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      
      // Create camera
      camera = new THREE.PerspectiveCamera(
        45, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
      );
      camera.position.set(0, 0, 5);
      
      // Create renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);
      
      // Set up lighting
      // Ambient light for general illumination
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      // Main directional light (like sun)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 7.5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      // Fill light from other side
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-5, 2, -7.5);
      scene.add(fillLight);
      
      // If unlocked, add special effect lights
      if (isUnlocked) {
        // Golden accent light
        const accentLight = new THREE.PointLight(0xc2a64b, 1);
        accentLight.position.set(2, 2, 2);
        scene.add(accentLight);
        
        // Purple/blue accent from below
        const accentLight2 = new THREE.PointLight(0x6a4bc2, 0.7);
        accentLight2.position.set(-2, -2, -2);
        scene.add(accentLight2);
      }
      
      // Set up controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 3;
      controls.maxDistance = 10;
      controls.maxPolarAngle = Math.PI / 1.5;
      controls.autoRotate = !isUnlocked; // Auto-rotate when not unlocked
      controls.autoRotateSpeed = 1;
      
      // Function to try loading the model from different paths
      const loadModel = async () => {
        const loader = new GLTFLoader();
        let loaded = false;
        let error = null;
        
        // Try each path until one works
        for (const path of modelPaths) {
          if (loaded) break;
          
          try {
            console.log(`Trying to load model from ${path}...`);
            const gltf = await new Promise<any>((resolve, reject) => {
              loader.load(
                path,
                resolve,
                (xhr) => {
                  console.log(`${path}: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
                },
                reject
              );
            });
            
            // Model loaded successfully
            console.log(`Successfully loaded model from ${path}`);
            loaded = true;
            
            // Process the model
            setupModel(gltf);
          } catch (err) {
            console.error(`Failed to load from ${path}:`, err);
            error = err;
          }
        }
        
        // If we couldn't load the model, create a placeholder
        if (!loaded) {
          console.error("Failed to load model from all paths:", error);
          createPlaceholderModel();
        }
      };
      
      // Function to set up the loaded model
      const setupModel = (gltf: any) => {
        const model = gltf.scene;
        
        // Analyze the model to get stats
        let polyCount = 0;
        let meshCount = 0;
        let materialCount = 0;
        const materials = new Set();
        
        model.traverse((node: any) => {
          if (node.isMesh) {
            meshCount++;
            if (node.geometry) {
              polyCount += node.geometry.attributes.position ? 
                node.geometry.attributes.position.count / 3 : 0;
            }
            if (node.material) {
              materials.add(node.material);
              
              // When unlocked, add glow to crystal elements
              if (isUnlocked) {
                const name = node.name.toLowerCase();
                if (name.includes('crystal') || name.includes('gem') || 
                    name.includes('orb') || name.includes('glow')) {
                  node.material.emissive = new THREE.Color(0xc2a64b);
                  node.material.emissiveIntensity = 0.3;
                }
              }
            }
            
            // Enable shadows
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        
        materialCount = materials.size;
        
        // Adjust position and scale for your specific CGTrader model
        model.position.set(0, -0.5, 0);
        model.scale.set(1.0, 1.0, 1.0); // Adjust if needed
        
        // Add the model to the scene
        scene.add(model);
        
        // Store model statistics
        setModelStats(`Polygons: ${Math.round(polyCount).toLocaleString()} | Meshes: ${meshCount} | Materials: ${materialCount}`);
        
        // Set up animations if any
        if (gltf.animations && gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          const animation = gltf.animations[0];
          mixer.clipAction(animation).play();
        }
        
        // Add hotspots if unlocked
        if (isUnlocked) {
          addHotspots();
        }
        
        setIsLoading(false);
      };
      
      // Function to create a fallback model if loading fails
      const createPlaceholderModel = () => {
        // Create a group to hold the placeholder objects
        const placeholderGroup = new THREE.Group();
        
        // Create a central sphere
        const coreMaterial = new THREE.MeshStandardMaterial({
          color: 0x6a4bc2,
          metalness: 0.8,
          roughness: 0.2,
          emissive: isUnlocked ? 0x6a4bc2 : 0x000000,
          emissiveIntensity: 0.2
        });
        
        const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        placeholderGroup.add(core);
        
        // Create rings
        const ringMaterial = new THREE.MeshStandardMaterial({
          color: 0xc2a64b,
          metalness: 0.9,
          roughness: 0.1,
          emissive: isUnlocked ? 0xc2a64b : 0x000000,
          emissiveIntensity: 0.3
        });
        
        // Add two orbital rings
        for (let i = 0; i < 2; i++) {
          const ringGeometry = new THREE.TorusGeometry(0.8 + i * 0.3, 0.02, 16, 100);
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.rotation.x = Math.PI / 2 + i * (Math.PI / 4);
          ring.rotation.y = i * (Math.PI / 3);
          placeholderGroup.add(ring);
        }
        
        // Add crystal formations
        const crystalMaterial = new THREE.MeshStandardMaterial({
          color: 0x6a4bc2,
          metalness: 0.8,
          roughness: 0.1,
          emissive: isUnlocked ? 0x6a4bc2 : 0x000000, 
          emissiveIntensity: 0.5
        });
        
        for (let i = 0; i < 5; i++) {
          const crystalGeometry = new THREE.ConeGeometry(0.1, 0.3, 5);
          const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
          
          const angle = (i / 5) * Math.PI * 2;
          const radius = 0.7;
          crystal.position.set(
            Math.cos(angle) * radius,
            0.2,
            Math.sin(angle) * radius
          );
          
          crystal.rotation.x = Math.PI;
          
          // Add userData for interaction
          crystal.userData = { 
            id: i === 0 ? 'center' : 
                i === 1 ? 'top-right' : 
                i === 2 ? 'bottom-left' : 
                i === 3 ? 'crystal' : 'ancient-mark',
            label: i === 0 ? 'Central Core' : 
                  i === 1 ? 'Energy Matrix' : 
                  i === 2 ? 'Ancient Inscription' : 
                  i === 3 ? 'Crystal Chamber' : 'Ancient Marking'
          };
          
          placeholderGroup.add(crystal);
        }
        
        // Add the placeholder to the scene
        scene.add(placeholderGroup);
        
        // Add hotspots if unlocked
        if (isUnlocked) {
          addHotspots();
        }
        
        setModelStats("Using fallback model (original not found)");
        setIsLoading(false);
      };
      
      // Function to add interactive hotspots
      const addHotspots = () => {
        const hotspotMaterial = new THREE.MeshBasicMaterial({
          color: 0xc2a64b,
          transparent: true,
          opacity: 0.8
        });
        
        // Define hotspots - adjust positions as needed
        const hotspots = [
          { id: 'center', position: new THREE.Vector3(0, 0, 0), label: 'Central Core' },
          { id: 'top-right', position: new THREE.Vector3(0.6, 0.6, 0), label: 'Energy Matrix' },
          { id: 'bottom-left', position: new THREE.Vector3(-0.6, -0.3, 0), label: 'Ancient Inscription' },
          { id: 'crystal', position: new THREE.Vector3(0, 0.7, 0.4), label: 'Crystal Chamber' },
        ];
        
        hotspots.forEach(hotspot => {
          const hotspotGeometry = new THREE.SphereGeometry(0.05, 16, 16);
          const hotspotMesh = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
          hotspotMesh.position.copy(hotspot.position);
          hotspotMesh.userData = { id: hotspot.id, label: hotspot.label };
          scene.add(hotspotMesh);
        });
      };
      
      // Set up raycaster for interactions
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      
      // Click handler for hotspots
      const onClick = (event: MouseEvent) => {
        if (!isUnlocked) return;
        
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
          let object = intersects[0].object;
          
          // Walk up the parent chain if needed to find objects with userData
          while (object && !object.userData?.id && object.parent) {
            object = object.parent;
          }
          
          if (object && object.userData?.id) {
            onHotspotClick(object.userData.id);
          }
        }
      };
      
      // Handle window resizing
      const onWindowResize = () => {
        if (!containerRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      // Animation loop
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        // Update controls
        controls.update();
        
        // Update any animations
        if (mixer) {
          const delta = clock.getDelta();
          mixer.update(delta);
        }
        
        // Render the scene
        renderer.render(scene, camera);
      };
      
      // Add event listeners
      window.addEventListener('resize', onWindowResize);
      containerRef.current!.addEventListener('click', onClick);
      
      // Start loading the model
      loadModel();
      
      // Start animation loop
      animate();
      
      // Clean up function
      return () => {
        // Stop animation
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
        
        // Remove event listeners
        window.removeEventListener('resize', onWindowResize);
        if (containerRef.current) {
          containerRef.current.removeEventListener('click', onClick);
        }
        
        // Remove renderer from DOM
        if (renderer && containerRef.current) {
          containerRef.current.removeChild(renderer.domElement);
        }
        
        // Dispose of Three.js resources
        if (scene) {
          scene.traverse((object: any) => {
            if (object.geometry) {
              object.geometry.dispose();
            }
            
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material: any) => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
        }
        
        if (renderer) {
          renderer.dispose();
        }
      };
    };
    
    // Initialize the viewer
    const cleanup = init();
    
    // Clean up on unmount
    return cleanup;
  }, [isUnlocked, onHotspotClick, modelPaths]);

  return (
    <div className="relative w-full h-full">
      {/* Dark background with sacred geometry pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-95 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/0 to-black/80"></div>
        <div className="absolute inset-0 opacity-5 bg-repeat"></div>
      </div>
      
      {/* 3D Viewer container */}
      <div 
        ref={containerRef} 
        className="relative w-full h-full z-10"
      />
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-2" />
            <p className="text-amber-200 text-sm">Loading your CGTrader artifact...</p>
          </div>
        </div>
      )}
      
      {/* Model statistics overlay */}
      {modelStats && !isLoading && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-amber-200/90 px-3 py-1 rounded text-xs z-20">
          {modelStats}
        </div>
      )}
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-amber-200/80 px-4 py-2 rounded-full text-sm z-20">
        {isUnlocked ? "Click glowing points to explore • Drag to rotate • Scroll to zoom" : "Drag to rotate • Scroll to zoom"}
      </div>
    </div>
  );
}