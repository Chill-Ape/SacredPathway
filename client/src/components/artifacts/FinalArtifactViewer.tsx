import React, { useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface FinalArtifactViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

export default function FinalArtifactViewer({ isUnlocked, onHotspotClick }: FinalArtifactViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let animationId: number;
    let scene: any, camera: any, renderer: any, controls: any;
    let model: any;

    const init = async () => {
      try {
        // Import Three.js dynamically
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader');

        // Set up scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        // Set up camera
        camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        camera.position.set(0, 0, 3);

        // Set up renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
        container.appendChild(renderer.domElement);

        // Set up lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight1.position.set(5, 5, 5);
        directionalLight1.castShadow = true;
        scene.add(directionalLight1);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight2.position.set(-5, 5, -5);
        directionalLight2.castShadow = true;
        scene.add(directionalLight2);

        // Enhanced lighting for unlocked state
        if (isUnlocked) {
          const pointLight = new THREE.PointLight(0xc2a64b, 1, 10);
          pointLight.position.set(0, 0, 2);
          scene.add(pointLight);

          const pointLight2 = new THREE.PointLight(0x6a4bc2, 0.8, 10);
          pointLight2.position.set(0, 0, -2);
          scene.add(pointLight2);
        }

        // Set up controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.minDistance = 2;
        controls.maxDistance = 10;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Set up GLTF loader with Draco compression support
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        // Create a group for the model
        model = new THREE.Group();
        scene.add(model);

        // Try all possible paths for the model
        const modelPaths = [
          '/artifacts/3d_artifact.glb',   // Try path in artifacts folder
          '/3d_artifact.glb',             // Try root path
          '/models/3d_artifact.glb',      // Try models folder 
          '/assets/3d_objects/3d_artifact.glb', // Try encoded path
          '/assets/3d objects/3d_artifact.glb'  // Try original path
        ];

        let modelLoaded = false;

        for (const path of modelPaths) {
          if (modelLoaded) continue;

          try {
            console.log(`Attempting to load model from: ${path}`);
            const gltf = await new Promise<any>((resolve, reject) => {
              loader.load(
                path, 
                resolve, 
                xhr => {
                  console.log(`${path}: ${Math.round(xhr.loaded / xhr.total * 100)}% loaded`);
                },
                reject
              );
            });

            // Model loaded successfully
            modelLoaded = true;
            console.log(`Successfully loaded model from: ${path}`);
            
            // Position and scale for your specific CGTrader model
            gltf.scene.position.set(0, -0.5, 0);
            gltf.scene.scale.set(1.5, 1.5, 1.5);

            // Process materials
            gltf.scene.traverse((node: any) => {
              if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;

                // For unlocked state, add subtle glows to crystal elements
                if (isUnlocked && node.material) {
                  const name = node.name.toLowerCase();
                  if (name.includes('crystal') || name.includes('gem') || 
                      name.includes('orb') || name.includes('glow')) {
                    node.material.emissive = new THREE.Color(0xc2a64b);
                    node.material.emissiveIntensity = 0.3;
                  }
                }
              }
            });

            model.add(gltf.scene);
            
            // Add hotspots if unlocked
            if (isUnlocked) {
              const hotspotMaterial = new THREE.MeshBasicMaterial({
                color: 0xc2a64b,
                transparent: true,
                opacity: 0.8
              });
              
              // Adjust these positions to match your specific model
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
                model.add(hotspotMesh);
              });
            }
            
            break; // Exit the loop since we've loaded the model
          } catch (err) {
            console.error(`Failed to load model from ${path}:`, err);
            // Continue to next path
          }
        }

        // If no model was loaded, create a placeholder
        if (!modelLoaded) {
          console.log("Unable to load model, creating visual placeholder");
          
          // Create a placeholder model
          const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0x6a4bc2,
            metalness: 0.8,
            roughness: 0.2,
            emissive: isUnlocked ? 0x6a4bc2 : 0x000000,
            emissiveIntensity: 0.2
          });
          
          const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
          const core = new THREE.Mesh(coreGeometry, coreMaterial);
          model.add(core);
          
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
          model.add(ring1);
          
          const ring2Geometry = new THREE.TorusGeometry(1, 0.02, 16, 100);
          const ring2 = new THREE.Mesh(ring2Geometry, ringMaterial);
          ring2.rotation.x = Math.PI / 2;
          ring2.rotation.y = Math.PI / 4;
          model.add(ring2);
          
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
            
            model.add(crystal);
          }
        }

        // Set up raycaster for interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onClick = (event: MouseEvent) => {
          if (!isUnlocked) return;
          
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(model.children, true);
          
          if (intersects.length > 0) {
            let obj = intersects[0].object;
            while (obj && !obj.userData?.id) {
              obj = obj.parent;
            }
            
            if (obj && obj.userData?.id) {
              onHotspotClick(obj.userData.id);
            }
          }
        };

        container.addEventListener('click', onClick);

        // Handle window resize
        const onResize = () => {
          if (!containerRef.current) return;
          
          const newWidth = containerRef.current.clientWidth;
          const newHeight = containerRef.current.clientHeight;
          
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', onResize);

        // Animation loop
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          if (controls) controls.update();
          if (renderer && scene && camera) renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);

        // Clean up function
        return () => {
          cancelAnimationFrame(animationId);
          container.removeEventListener('click', onClick);
          window.removeEventListener('resize', onResize);
          
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
      } catch (err) {
        console.error('Failed to initialize 3D viewer:', err);
        setErrorMessage('Could not initialize 3D viewer. Please check browser compatibility.');
        setIsLoading(false);
      }
    };

    // Start initialization
    init();

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
            <p className="text-amber-200 text-sm">Loading your artifact...</p>
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
        {isUnlocked ? "Click glowing points to explore • Drag to rotate • Scroll to zoom" : "Drag to rotate • Scroll to zoom"}
      </div>
    </div>
  );
}