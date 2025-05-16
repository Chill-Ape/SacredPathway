import React, { useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ArtifactModelViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

export default function ArtifactModelViewer({ isUnlocked, onHotspotClick }: ArtifactModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Create a custom model when we can't load the glb file
  const createVisuallyRichFallbackModel = async (
    scene: any, 
    THREE: any, 
    modelGroup: any,
    isUnlocked: boolean
  ) => {
    // Create core sphere
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a4bc2,
      metalness: 0.8,
      roughness: 0.2,
      emissive: isUnlocked ? 0x6a4bc2 : 0x000000,
      emissiveIntensity: 0.2
    });
    
    const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    modelGroup.add(core);
    
    // Create rings
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2a64b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: isUnlocked ? 0xc2a64b : 0x000000,
      emissiveIntensity: 0.3
    });
    
    const ring1Geometry = new THREE.TorusGeometry(0.8, 0.02, 16, 100);
    const ring1 = new THREE.Mesh(ring1Geometry, ringMaterial);
    ring1.rotation.x = Math.PI / 4;
    modelGroup.add(ring1);
    
    const ring2Geometry = new THREE.TorusGeometry(1, 0.02, 16, 100);
    const ring2 = new THREE.Mesh(ring2Geometry, ringMaterial);
    ring2.rotation.x = Math.PI / 2;
    ring2.rotation.y = Math.PI / 4;
    modelGroup.add(ring2);
    
    // Add crystals
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
      crystal.rotation.z = Math.random() * Math.PI;
      
      // Add user data for interaction
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
      
      modelGroup.add(crystal);
    }
    
    // Add orbs
    const orbMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2a64b,
      metalness: 1,
      roughness: 0,
      emissive: isUnlocked ? 0xc2a64b : 0x000000,
      emissiveIntensity: 0.8
    });
    
    for (let i = 0; i < 8; i++) {
      const orbGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const orb = new THREE.Mesh(orbGeometry, orbMaterial);
      
      const angle = (i / 8) * Math.PI * 2;
      const radius = 1.2;
      const height = Math.sin(angle * 2) * 0.3;
      
      orb.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      modelGroup.add(orb);
    }
    
    // Add hotspots if unlocked
    if (isUnlocked) {
      const hotspotMaterial = new THREE.MeshStandardMaterial({
        color: 0xc2a64b,
        emissive: 0xc2a64b,
        emissiveIntensity: 0.6
      });
      
      const hotspots = [
        { id: 'center', position: new THREE.Vector3(0, 0, 0), label: 'Central Core' },
        { id: 'top-right', position: new THREE.Vector3(0.5, 0.5, 0), label: 'Energy Matrix' },
        { id: 'bottom-left', position: new THREE.Vector3(-0.5, -0.5, 0), label: 'Ancient Inscription' },
        { id: 'crystal', position: new THREE.Vector3(0, 0.5, 0.5), label: 'Crystal Chamber' },
      ];
      
      hotspots.forEach(hotspot => {
        const hotspotGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const hotspotMesh = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
        hotspotMesh.position.copy(hotspot.position);
        hotspotMesh.userData = { id: hotspot.id, label: hotspot.label };
        modelGroup.add(hotspotMesh);
      });
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    const initThree = async () => {
      try {
        if (!containerRef.current) return;
        
        // Dynamic imports to avoid SSR issues
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
        
        const container = containerRef.current;
        
        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(
          45, 
          container.clientWidth / container.clientHeight, 
          0.1, 
          1000
        );
        camera.position.z = 3;
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Special effect lights when unlocked
        if (isUnlocked) {
          const pointLight1 = new THREE.PointLight(0xc2a64b, 1.5);
          pointLight1.position.set(0, 1, 1);
          scene.add(pointLight1);
          
          const pointLight2 = new THREE.PointLight(0x6a4bc2, 0.5);
          pointLight2.position.set(0, -1, -1);
          scene.add(pointLight2);
        }
        
        // Add controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.minDistance = 1.5;
        controls.maxDistance = 5;
        
        // Create model group
        const modelGroup = new THREE.Group();
        scene.add(modelGroup);
        
        // Try to load the 3D model
        const loader = new GLTFLoader();
        
        try {
          // Try to load the model from various locations
          const gltf = await new Promise<any>((resolve, reject) => {
            // First try the model in the public folder
            loader.load(
              '/models/3d_artifact.glb', 
              resolve,
              undefined, 
              () => {
                // If failed, try from assets with spaces encoded
                loader.load(
                  '/assets/3d_objects/3d_artifact.glb',
                  resolve,
                  undefined,
                  () => {
                    // Final attempt with original path
                    loader.load(
                      '/assets/3d objects/3d_artifact.glb',
                      resolve,
                      undefined,
                      (error) => reject(error)
                    );
                  }
                );
              }
            );
          });
          
          // We successfully loaded the model
          const model = gltf.scene;
          
          // Scale and position the model
          model.scale.set(1, 1, 1);
          
          // Enhance model materials
          model.traverse((node: any) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              
              if (node.material) {
                // Enhance material properties
                if (node.material.metalness !== undefined) {
                  node.material.metalness = 0.8;
                }
                if (node.material.roughness !== undefined) {
                  node.material.roughness = 0.2;
                }
                
                // Make crystals glow when unlocked
                if (isUnlocked && 
                    (node.name.toLowerCase().includes('crystal') || 
                     node.name.toLowerCase().includes('gem'))) {
                  node.material.emissive = new THREE.Color(0xc2a64b);
                  node.material.emissiveIntensity = 0.5;
                }
              }
            }
          });
          
          modelGroup.add(model);
          
          // Add hotspots if unlocked
          if (isUnlocked) {
            const hotspotMaterial = new THREE.MeshStandardMaterial({
              color: 0xc2a64b,
              emissive: 0xc2a64b,
              emissiveIntensity: 0.6
            });
            
            const hotspots = [
              { id: 'center', position: new THREE.Vector3(0, 0, 0), label: 'Central Core' },
              { id: 'top-right', position: new THREE.Vector3(0.5, 0.5, 0), label: 'Energy Matrix' },
              { id: 'bottom-left', position: new THREE.Vector3(-0.5, -0.5, 0), label: 'Ancient Inscription' },
              { id: 'crystal', position: new THREE.Vector3(0, 0.5, 0.5), label: 'Crystal Chamber' },
            ];
            
            hotspots.forEach(hotspot => {
              const hotspotGeometry = new THREE.SphereGeometry(0.05, 16, 16);
              const hotspotMesh = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
              hotspotMesh.position.copy(hotspot.position);
              hotspotMesh.userData = { id: hotspot.id, label: hotspot.label };
              modelGroup.add(hotspotMesh);
            });
          }
          
        } catch (error) {
          console.log('Error loading model, creating fallback:', error);
          // If we fail to load the model, create a fallback
          await createVisuallyRichFallbackModel(scene, THREE, modelGroup, isUnlocked);
        }
        
        // Handle interactions
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const onClick = (event: MouseEvent) => {
          if (!isUnlocked) return;
          
          // Calculate mouse position in normalized device coordinates
          const rect = container.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
          
          // Cast ray through mouse position
          raycaster.setFromCamera(mouse, camera);
          
          // Check for intersections with objects that have userData.id
          const intersects = raycaster.intersectObjects(modelGroup.children, true);
          
          for (let i = 0; i < intersects.length; i++) {
            let obj = intersects[i].object;
            // Walk up the parent chain to find an object with userData.id
            while (obj && !obj.userData?.id) {
              obj = obj.parent;
            }
            
            if (obj && obj.userData?.id) {
              onHotspotClick(obj.userData.id);
              break;
            }
          }
        };
        
        container.addEventListener('click', onClick);
        
        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };
        
        window.addEventListener('resize', handleResize);
        
        // Animation loop
        let frameId: number | null = null;
        
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          
          // Gently rotate the model
          modelGroup.rotation.y += 0.002;
          
          controls.update();
          renderer.render(scene, camera);
        };
        
        animate();
        setIsLoading(false);
        
        // Clean up
        cleanup = () => {
          if (frameId !== null) {
            cancelAnimationFrame(frameId);
          }
          
          if (container && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          
          container.removeEventListener('click', onClick);
          window.removeEventListener('resize', handleResize);
          
          // Dispose of Three.js resources
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
          
          renderer.dispose();
        };
      } catch (error) {
        console.error('Failed to initialize ThreeJS:', error);
        setErrorMessage('Could not initialize 3D viewer. Please check your browser compatibility.');
        setIsLoading(false);
      }
    };
    
    initThree();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [isUnlocked, onHotspotClick]);

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
            <p className="text-amber-200 text-sm">Loading artifact...</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-black/70 p-4 rounded-lg text-amber-200 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Unable to Load 3D Model</h3>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-amber-200/80 px-4 py-2 rounded-full text-sm z-20">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}