import React, { useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Using pure Three.js approach for maximum reliability with complex models
interface PureThreeViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

export default function PureThreeViewer({ isUnlocked, onHotspotClick }: PureThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let renderer: any, scene: any, camera: any, controls: any;
    let modelGroup: any;
    let cancelAnimation = false;

    // Load Three.js dynamically to avoid SSR issues
    import('three').then(async (THREE) => {
      // Dynamic imports for Three.js modules
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');

      try {
        // Setup renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setClearColor(0x000000, 1);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Setup scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Setup camera
        camera = new THREE.PerspectiveCamera(
          45, 
          container.clientWidth / container.clientHeight, 
          0.1, 
          1000
        );
        camera.position.z = 3;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const spotLight = new THREE.SpotLight(0xffffff, 0.5);
        spotLight.position.set(-5, 5, 2);
        spotLight.angle = 0.3;
        spotLight.penumbra = 1;
        spotLight.castShadow = true;
        scene.add(spotLight);

        // Special effect lights when unlocked
        if (isUnlocked) {
          const point1 = new THREE.PointLight(0xc2a64b, 1.5);
          point1.position.set(0, 1, 2);
          scene.add(point1);
          
          const point2 = new THREE.PointLight(0x8568b9, 0.8);
          point2.position.set(0, -1, -2);
          scene.add(point2);
        }

        // Setup controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minPolarAngle = Math.PI / 6;
        controls.maxPolarAngle = Math.PI / 1.5;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.update();

        // Create a group for the model
        modelGroup = new THREE.Group();
        scene.add(modelGroup);

        // Define hotspots - will be visible when unlocked
        const hotspots = [
          { id: 'center', position: new THREE.Vector3(0, 0.2, 0), label: 'Central Core' },
          { id: 'top-right', position: new THREE.Vector3(0.5, 0.3, 0.2), label: 'Energy Matrix' },
          { id: 'bottom-left', position: new THREE.Vector3(-0.3, -0.1, 0.2), label: 'Ancient Inscription' },
          { id: 'crystal', position: new THREE.Vector3(0.2, 0.4, -0.3), label: 'Crystal Chamber' },
        ];

        // Add hotspots if unlocked
        if (isUnlocked) {
          hotspots.forEach(hotspot => {
            const geometry = new THREE.SphereGeometry(0.05, 16, 16);
            const material = new THREE.MeshStandardMaterial({
              color: 0xc2a64b,
              emissive: 0xc2a64b,
              emissiveIntensity: 0.4
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(hotspot.position);
            mesh.userData.id = hotspot.id;
            mesh.userData.label = hotspot.label;
            modelGroup.add(mesh);
          });
        }

        // Load the actual 3D model
        const loader = new GLTFLoader();
        
        // Try loading model from different possible paths
        loader.load(
          '/assets/3d_objects/3d_artifact.glb',
          function(gltf) {
            handleModelLoaded(gltf);
          },
          function(xhr) {
            // Progress callback
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
          },
          function(error) {
            console.log('Error loading model from first path, trying alternative...');
            
            // Try second path
            loader.load(
              '/models/3d_artifact.glb',
              function(gltf) {
                handleModelLoaded(gltf);
              },
              function(xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
              },
              function(error) {
                console.log('Error loading from second path, trying original location...');
                
                // Try original path in src assets
                loader.load(
                  '/assets/3d objects/3d_artifact.glb',
                  function(gltf) {
                    handleModelLoaded(gltf);
                  },
                  function(xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                  },
                  function(error) {
                    console.error('Failed to load 3D model from all paths:', error);
                    setErrorMessage('Could not load 3D model. Please ensure the file exists at the correct path.');
                    setIsLoading(false);
                  }
                );
              }
            );
          }
        );

        function handleModelLoaded(gltf: any) {
          const model = gltf.scene;
          
          // Scale and center model
          model.scale.set(1.5, 1.5, 1.5);
          model.position.set(0, -0.5, 0);
          
          // Enhance materials
          model.traverse((node: any) => {
            if (node.isMesh) {
              // Enable shadows
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
          setIsLoading(false);
        }

        // Setup raycaster for interactions
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Handle click events for hotspots
        function onClick(event: MouseEvent) {
          if (!isUnlocked) return;
          
          // Calculate mouse position in normalized device coordinates
          const rect = container.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
          
          // Cast ray through mouse position
          raycaster.setFromCamera(mouse, camera);
          
          // Check for intersections with hotspots
          const intersects = raycaster.intersectObjects(modelGroup.children, true);
          
          for (let i = 0; i < intersects.length; i++) {
            const object = intersects[i].object;
            if (object.userData && object.userData.id) {
              onHotspotClick(object.userData.id);
              break;
            }
          }
        }

        // Handle window resize
        function handleResize() {
          if (!camera || !renderer || !container) return;
          
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        }

        // Animate the scene
        function animate() {
          if (cancelAnimation) return;
          
          requestAnimationFrame(animate);
          
          // Auto-rotate when not interacting
          if (controls && !controls.enabled && modelGroup) {
            modelGroup.rotation.y += 0.005;
          }
          
          if (controls) controls.update();
          if (renderer && scene && camera) renderer.render(scene, camera);
        }

        // Add event listeners
        window.addEventListener('resize', handleResize);
        container.addEventListener('click', onClick);
        
        // Start animation
        animate();

        // Cleanup on unmount
        return () => {
          cancelAnimation = true;
          window.removeEventListener('resize', handleResize);
          container.removeEventListener('click', onClick);
          
          if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          
          // Dispose of Three.js resources
          if (scene) {
            scene.traverse((object: any) => {
              if (object.geometry) object.geometry.dispose();
              
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((material: any) => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });
          }
          
          if (renderer) renderer.dispose();
          if (controls) controls.dispose();
        };
      } catch (error) {
        console.error('Error initializing Three.js:', error);
        setErrorMessage('Error initializing 3D viewer. Please try again.');
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('Error loading Three.js:', error);
      setErrorMessage('Could not load 3D rendering library. Please try again.');
      setIsLoading(false);
    });

    return () => {
      cancelAnimation = true;
    };
  }, [isUnlocked, onHotspotClick]);

  return (
    <div className="relative w-full h-full">
      {/* Dark background for 3D scene - sacred vault style */}
      <div className="absolute inset-0 bg-black bg-opacity-95 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/0 to-black/80"></div>
        <div className="absolute inset-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
      </div>
      
      {/* 3D Canvas container */}
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