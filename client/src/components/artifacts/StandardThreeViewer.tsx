import React, { useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface StandardThreeViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

export default function StandardThreeViewer({ isUnlocked, onHotspotClick }: StandardThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cleanup: (() => void) | null = null;

    const setupViewer = async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');

        // Setup container
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Create camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 3);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        if (isUnlocked) {
          // Add special lighting effects for unlocked state
          const pointLight1 = new THREE.PointLight(0xc2a64b, 1);
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
        controls.rotateSpeed = 0.5;
        controls.minDistance = 1.5;
        controls.maxDistance = 10;

        // Create a model group that will contain our loaded model and hotspots
        const modelGroup = new THREE.Group();
        scene.add(modelGroup);
        
        // Load the 3D model using file path based on environment
        const loader = new GLTFLoader();
        
        // Utility to create hotspots
        const createHotspots = () => {
          if (!isUnlocked) return;
          
          const hotspots = [
            { id: 'center', position: new THREE.Vector3(0, 0, 0), label: 'Central Core' },
            { id: 'top-right', position: new THREE.Vector3(0.5, 0.5, 0), label: 'Energy Matrix' },
            { id: 'bottom-left', position: new THREE.Vector3(-0.5, -0.5, 0), label: 'Ancient Inscription' },
            { id: 'crystal', position: new THREE.Vector3(0, 0.5, 0.5), label: 'Crystal Chamber' },
          ];
          
          hotspots.forEach(hotspot => {
            const geometry = new THREE.SphereGeometry(0.05, 16, 16);
            const material = new THREE.MeshStandardMaterial({
              color: 0xc2a64b,
              emissive: 0xc2a64b,
              emissiveIntensity: 0.6
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(hotspot.position);
            mesh.userData = { id: hotspot.id, label: hotspot.label };
            modelGroup.add(mesh);
          });
        };
        
        // Instead of loading the actual model, let's create a placeholder model
        // for demonstration purposes
        const createPlaceholderModel = () => {
          // Create a central sphere
          const coreSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshStandardMaterial({ 
              color: 0x6a4bc2,
              metalness: 0.8,
              roughness: 0.2
            })
          );
          modelGroup.add(coreSphere);
          
          // Create orbital rings
          const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.02, 16, 100),
            new THREE.MeshStandardMaterial({ 
              color: 0xc2a64b,
              emissive: isUnlocked ? 0xc2a64b : 0x000000,
              emissiveIntensity: 0.3,
              metalness: 0.9,
              roughness: 0.1
            })
          );
          ring1.rotation.x = Math.PI / 4;
          modelGroup.add(ring1);
          
          const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.02, 16, 100),
            new THREE.MeshStandardMaterial({ 
              color: 0xc2a64b,
              emissive: isUnlocked ? 0xc2a64b : 0x000000,
              emissiveIntensity: 0.3,
              metalness: 0.9,
              roughness: 0.1
            })
          );
          ring2.rotation.x = Math.PI / 2;
          ring2.rotation.y = Math.PI / 4;
          modelGroup.add(ring2);
          
          // Add crystal formations
          for (let i = 0; i < 5; i++) {
            const crystal = new THREE.Mesh(
              new THREE.ConeGeometry(0.1, 0.3, 5),
              new THREE.MeshStandardMaterial({ 
                color: 0x6a4bc2,
                emissive: isUnlocked ? 0x6a4bc2 : 0x000000,
                emissiveIntensity: 0.5,
                metalness: 0.8,
                roughness: 0.1
              })
            );
            const angle = (i / 5) * Math.PI * 2;
            const radius = 0.7;
            crystal.position.set(
              Math.cos(angle) * radius, 
              0.2,
              Math.sin(angle) * radius
            );
            crystal.rotation.x = Math.PI;
            crystal.rotation.z = Math.random() * Math.PI;
            modelGroup.add(crystal);
          }
          
          // Add small orbs
          for (let i = 0; i < 8; i++) {
            const orb = new THREE.Mesh(
              new THREE.SphereGeometry(0.08, 16, 16),
              new THREE.MeshStandardMaterial({ 
                color: 0xc2a64b,
                emissive: isUnlocked ? 0xc2a64b : 0x000000,
                emissiveIntensity: 0.8,
                metalness: 1,
                roughness: 0
              })
            );
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
          
          setIsLoading(false);
        };

        // Try to load the GLTF model
        loader.load(
          '/assets/3d_objects/3d_artifact.glb',
          (gltf) => {
            modelGroup.add(gltf.scene);
            createHotspots();
            setIsLoading(false);
          },
          undefined,
          (error) => {
            console.log('Falling back to placeholder model:', error);
            createPlaceholderModel();
            createHotspots();
            setIsLoading(false);
          }
        );

        // Handle click events
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        const onClick = (event: MouseEvent) => {
          if (!isUnlocked) return;
          
          const rect = container.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(modelGroup.children, true);
          
          if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && !obj.userData?.id) {
              obj = obj.parent as THREE.Object3D;
            }
            
            if (obj && obj.userData?.id) {
              onHotspotClick(obj.userData.id);
            }
          }
        };
        
        container.addEventListener('click', onClick);
        
        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };
        
        window.addEventListener('resize', handleResize);

        // Animation loop
        let frameId: number;
        const animate = () => {
          frameId = requestAnimationFrame(animate);
          
          // Auto-rotate when controls are inactive
          if (!controls.enabled) {
            modelGroup.rotation.y += 0.005;
          }
          
          controls.update();
          renderer.render(scene, camera);
        };
        
        animate();
        
        // Return cleanup function
        cleanup = () => {
          cancelAnimationFrame(frameId);
          container.removeEventListener('click', onClick);
          window.removeEventListener('resize', handleResize);
          
          // Dispose of Three.js resources
          scene.traverse((object) => {
            if ((object as THREE.Mesh).isMesh) {
              const mesh = object as THREE.Mesh;
              if (mesh.geometry) mesh.geometry.dispose();
              
              if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach(material => material.dispose());
                } else {
                  mesh.material.dispose();
                }
              }
            }
          });
          
          renderer.dispose();
          
          // Remove renderer from DOM
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };
      } catch (error) {
        console.error('Three.js setup error:', error);
        setErrorMessage('Could not initialize 3D viewer. Please check your browser compatibility.');
        setIsLoading(false);
      }
    };

    setupViewer();

    return () => {
      if (cleanup) cleanup();
    };
  }, [isUnlocked, onHotspotClick]);

  return (
    <div className="relative w-full h-full">
      {/* Dark background with sacred geometry pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-95 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/0 to-black/80"></div>
        <div className="absolute inset-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
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