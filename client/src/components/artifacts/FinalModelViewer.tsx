import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function FinalModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      50, 
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Use these settings for better color appearance
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controlsRef.current = controls;
    
    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0x2266ff, 1, 10);
    pointLight.position.set(-2, 1, 3);
    scene.add(pointLight);
    
    // Load Model - try multiple paths
    const loader = new GLTFLoader();
    const modelPaths = [
      '/burger_model.glb',
      '/assets/3d_objects/uploads_files_2465920_burger_merged.glb',
      'client/src/assets/3d objects/uploads_files_2465920_burger_merged.glb'
    ];
    
    const loadModel = async () => {
      let loadError = null;
      
      for (const path of modelPaths) {
        try {
          console.log(`Attempting to load model from ${path}...`);
          
          // Add proper type annotations
          const gltf = await new Promise<any>((resolve, reject) => {
            loader.load(
              path, 
              (gltf: any) => resolve(gltf),
              (xhr: { loaded: number; total: number }) => {
                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log(`${path}: ${percentComplete}% loaded`);
              },
              (error: any) => {
                console.error(`Error loading model from ${path}:`, error);
                reject(error);
              }
            );
          });
          
          if (modelRef.current) {
            scene.remove(modelRef.current);
          }
          
          const model = gltf.scene;
          model.position.set(0, 0, 0);
          model.scale.set(0.5, 0.5, 0.5);
          scene.add(model);
          modelRef.current = model;
          
          console.log(`Successfully loaded model from ${path}`);
          return; // Exit if successful
        } catch (error) {
          loadError = error;
          console.log(`Failed to load from ${path}:`, error);
        }
      }
      
      if (loadError) {
        console.error("Failed to load model from all paths:", loadError);
        createFallbackModel();
      }
    };
    
    // Create a fallback model
    const createFallbackModel = () => {
      console.log("Creating fallback visualization...");
      
      const group = new THREE.Group();
      
      // Create base cylinder
      const cylinderGeom = new THREE.CylinderGeometry(1, 1, 0.5, 32);
      const cylinderMat = new THREE.MeshStandardMaterial({ 
        color: 0x3366aa,
        metalness: 0.8,
        roughness: 0.2
      });
      const cylinder = new THREE.Mesh(cylinderGeom, cylinderMat);
      cylinder.position.y = -0.5;
      group.add(cylinder);
      
      // Add crystal structures on top
      const crystalGeom = new THREE.ConeGeometry(0.2, 1, 5);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x66aaff,
        metalness: 0.1,
        roughness: 0.3,
        transparent: true,
        opacity: 0.8
      });
      
      // Add multiple crystal formations
      const crystalPositions = [
        { x: 0, y: 0, z: 0, scale: 1.5 },
        { x: 0.5, y: -0.2, z: 0.2, scale: 1.2, rotation: 0.5 },
        { x: -0.4, y: -0.1, z: 0.3, scale: 1.0, rotation: -0.3 },
        { x: 0.2, y: 0.1, z: -0.4, scale: 0.8, rotation: 0.2 },
        { x: -0.3, y: -0.2, z: -0.5, scale: 1.1, rotation: -0.4 }
      ];
      
      crystalPositions.forEach(pos => {
        const crystal = new THREE.Mesh(crystalGeom, crystalMat);
        crystal.position.set(pos.x, pos.y + 0.5, pos.z);
        crystal.scale.set(pos.scale, pos.scale, pos.scale);
        if (pos.rotation) {
          crystal.rotation.z = pos.rotation;
        }
        group.add(crystal);
      });
      
      // Add a glowing sphere in the center
      const sphereGeom = new THREE.SphereGeometry(0.3, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x66ffff,
        transparent: true,
        opacity: 0.5
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.y = 0.2;
      group.add(sphere);
      
      scene.add(group);
      modelRef.current = group;
      
      // Add a spot highlight
      const spotLight = new THREE.SpotLight(0x00aaff, 2);
      spotLight.position.set(0, 5, 0);
      spotLight.angle = 0.3;
      spotLight.penumbra = 0.7;
      spotLight.target = group;
      scene.add(spotLight);
    };
    
    loadModel();
    
    // Animation loop
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.002;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      // Clean up
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      if (rendererRef.current && rendererRef.current.domElement && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-[600px] bg-black/90 rounded-lg overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  );
}