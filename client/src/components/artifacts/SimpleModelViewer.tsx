import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * A simpler 3D model viewer that uses basic Three.js functionality
 * and focuses on showing the fallback model with good visual quality
 */
export default function SimpleModelViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    const pointLight1 = new THREE.PointLight(0x3366ff, 2, 20);
    pointLight1.position.set(2, 2, 4);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x0099ff, 2, 20);
    pointLight2.position.set(-2, 1, -2);
    scene.add(pointLight2);
    
    // Create artifact model
    const group = new THREE.Group();
    
    // Base
    const baseGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.5, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x334466,
      metalness: 0.7,
      roughness: 0.3,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -1;
    group.add(base);
    
    // Middle piece
    const middleGeometry = new THREE.CylinderGeometry(0.8, 1.2, 0.8, 16);
    const middleMaterial = new THREE.MeshStandardMaterial({
      color: 0x445588,
      metalness: 0.8,
      roughness: 0.2,
    });
    const middle = new THREE.Mesh(middleGeometry, middleMaterial);
    middle.position.y = -0.2;
    group.add(middle);
    
    // Crystal clusters - central structure
    const crystalPositions = [
      { x: 0, y: 0.8, z: 0, scale: 1.0, rotation: [0, 0, 0] },
      { x: 0.4, y: 0.5, z: 0.2, scale: 0.7, rotation: [0.2, 0.1, 0.7] },
      { x: -0.5, y: 0.4, z: -0.3, scale: 0.8, rotation: [0.1, 0.2, -0.5] },
      { x: 0.3, y: 0.6, z: -0.4, scale: 0.6, rotation: [-0.3, 0.1, 0.2] },
      { x: -0.2, y: 0.7, z: 0.5, scale: 0.5, rotation: [0.4, -0.2, 0.1] },
      { x: 0, y: 1.2, z: 0, scale: 0.4, rotation: [0, 0, 0] },
    ];
    
    // Create crystal geometry and material
    const crystalGeometry = new THREE.ConeGeometry(0.2, 1, 5);
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x66aaff,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.9,
      transparent: true,
      opacity: 0.7,
    });
    
    // Add multiple crystals to the group
    crystalPositions.forEach(pos => {
      const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
      crystal.position.set(pos.x, pos.y, pos.z);
      crystal.scale.set(pos.scale, pos.scale, pos.scale);
      
      if (pos.rotation) {
        crystal.rotation.x = pos.rotation[0];
        crystal.rotation.y = pos.rotation[1];
        crystal.rotation.z = pos.rotation[2];
      }
      
      group.add(crystal);
    });
    
    // Add energy orb in the center
    const sphereGeometry = new THREE.SphereGeometry(0.25, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
    });
    const energySphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    energySphere.position.y = 0.7;
    group.add(energySphere);
    
    // Add glow effect around the energy sphere
    const glowGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.copy(energySphere.position);
    group.add(glow);
    
    // Add energy lines
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff,
      transparent: true,
      opacity: 0.5,
    });
    
    // Create energy lines radiating from the sphere
    for (let i = 0; i < 8; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      const lineLength = 0.6 + Math.random() * 0.4;
      const angle = (i / 8) * Math.PI * 2;
      
      const vertices = new Float32Array([
        0, 0, 0,
        Math.sin(angle) * lineLength, 0.2 + Math.random() * 0.3, Math.cos(angle) * lineLength
      ]);
      
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.position.copy(energySphere.position);
      group.add(line);
    }
    
    // Add group to scene
    scene.add(group);
    
    // Animation
    let animationFrameId: number;
    const animate = () => {
      group.rotation.y += 0.005;
      
      // Make energy sphere pulse
      const time = Date.now() * 0.001;
      const pulseFactor = Math.sin(time * 2) * 0.1 + 1;
      energySphere.scale.set(pulseFactor, pulseFactor, pulseFactor);
      glow.scale.set(pulseFactor, pulseFactor, pulseFactor);
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
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
    
    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
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