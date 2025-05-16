import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Loader2 } from 'lucide-react';

interface SimpleThreeViewerProps {
  isUnlocked: boolean;
  onHotspotClick: (id: string) => void;
}

export default function SimpleThreeViewer({ isUnlocked, onHotspotClick }: SimpleThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hotspotInfo, setHotspotInfo] = useState<null | { id: string; position: THREE.Vector3; label: string }>(null);
  
  // Define hotspots
  const hotspots = [
    { id: 'center', position: new THREE.Vector3(0, 0, 0), label: 'Central Core' },
    { id: 'top-right', position: new THREE.Vector3(0.5, 0.5, 0), label: 'Energy Matrix' },
    { id: 'bottom-left', position: new THREE.Vector3(-0.5, -0.5, 0), label: 'Ancient Inscription' },
    { id: 'crystal', position: new THREE.Vector3(0, 0.5, 0.5), label: 'Crystal Chamber' },
  ];
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Setup scene, camera, renderer
    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // Configuration
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 1); // Black background
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    camera.position.z = 3;
    
    // Add lighting
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
    
    // Add special lighting when unlocked
    if (isUnlocked) {
      const point1 = new THREE.PointLight(0xc2a64b, 1.5);
      point1.position.set(0, 1, 2);
      scene.add(point1);
      
      const point2 = new THREE.PointLight(0x8568b9, 0.8);
      point2.position.set(0, -1, -2);
      scene.add(point2);
    }
    
    // Add controls for rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.update();
    
    // Load 3D model
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    
    // Raycaster for hotspot interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Hotspot visuals
    const hotspotMeshes: { [key: string]: THREE.Mesh } = {};
    
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
        hotspotMeshes[hotspot.id] = mesh;
      });
    }
    
    // Load the actual 3D model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/assets/3d objects/3d_artifact.glb',
      (gltf) => {
        setIsLoading(false);
        
        // Add model to the scene
        const model = gltf.scene;
        
        // Scale and position the model
        model.scale.set(1, 1, 1);
        
        // Enhance materials
        model.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            const mesh = node as THREE.Mesh;
            
            // Enable shadows
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Enhance material properties
            if (mesh.material) {
              const material = mesh.material as THREE.MeshStandardMaterial;
              if (material.metalness !== undefined) {
                material.metalness = 0.8;
              }
              if (material.roughness !== undefined) {
                material.roughness = 0.2;
              }
              
              // Make crystals glow when unlocked
              if (isUnlocked && 
                  (mesh.name.toLowerCase().includes('crystal') || 
                   mesh.name.toLowerCase().includes('gem'))) {
                material.emissive = new THREE.Color(0xc2a64b);
                material.emissiveIntensity = 0.5;
              }
            }
          }
        });
        
        modelGroup.add(model);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total) * 100 + '%');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );
    
    // Handle click events for hotspots
    function onClick(event: MouseEvent) {
      // Calculate mouse position in normalized device coordinates
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
      
      // Cast ray through mouse position
      raycaster.setFromCamera(mouse, camera);
      
      // Check for intersections with hotspots
      const intersects = raycaster.intersectObjects(Object.values(hotspotMeshes), true);
      
      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.id) {
          onHotspotClick(object.userData.id);
        }
      }
    }
    
    // Handle mousemove events for hover effects
    function onMouseMove(event: MouseEvent) {
      // Calculate mouse position in normalized device coordinates
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
      
      // Cast ray through mouse position
      raycaster.setFromCamera(mouse, camera);
      
      // Check for intersections with hotspots
      const intersects = raycaster.intersectObjects(Object.values(hotspotMeshes), true);
      
      if (intersects.length > 0) {
        const object = intersects[0].object;
        container.style.cursor = 'pointer';
        
        if (object.userData.id) {
          // Highlight the hotspot
          (object.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
          (object.material as THREE.MeshStandardMaterial).color.set(0xffc857);
          
          // Show tooltip
          setHotspotInfo({
            id: object.userData.id,
            position: object.position.clone(),
            label: object.userData.label
          });
        }
      } else {
        container.style.cursor = 'grab';
        
        // Reset all hotspots
        Object.values(hotspotMeshes).forEach(mesh => {
          (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
          (mesh.material as THREE.MeshStandardMaterial).color.set(0xc2a64b);
        });
        
        setHotspotInfo(null);
      }
    }
    
    // Auto rotation
    let previousTime = 0;
    const animate = (time: number) => {
      const delta = (time - previousTime) / 1000;
      previousTime = time;
      
      if (!controls.enabled) {
        modelGroup.rotation.y += delta * 0.2;
      }
      
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    // Handle window resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    container.addEventListener('click', onClick);
    container.addEventListener('mousemove', onMouseMove);
    
    // Start animation
    requestAnimationFrame(animate);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', onClick);
      container.removeEventListener('mousemove', onMouseMove);
      
      // Dispose of resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      renderer.dispose();
      controls.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isUnlocked, onHotspotClick]);
  
  return (
    <div className="relative w-full h-full">
      {/* Dark background for 3D scene - sacred vault style */}
      <div className="absolute inset-0 bg-black bg-opacity-95 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-gray-900/0 to-black/80"></div>
        <div className="absolute inset-0 bg-[url('/assets/sacred_geometry.svg')] opacity-5 bg-repeat"></div>
      </div>
      
      {/* 3D viewer container */}
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
      
      {/* Hotspot tooltip */}
      {hotspotInfo && (
        <div 
          className="absolute bg-black/80 px-2 py-1 rounded text-amber-200 text-xs whitespace-nowrap z-30 pointer-events-none"
          style={{
            left: containerRef.current ? containerRef.current.clientWidth / 2 : '50%',
            top: containerRef.current ? containerRef.current.clientHeight / 2 : '50%',
            transform: 'translate(-50%, -100%)'
          }}
        >
          {hotspotInfo.label}
        </div>
      )}
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-amber-200/80 px-4 py-2 rounded-full text-sm z-20">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}