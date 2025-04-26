import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ParticleBackground() {
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (isInitialized) return; // Prevent multiple initializations

    setIsInitialized(true);

    // Scene setup with improved performance settings
    const scene = new THREE.Scene();

    // Camera setup with better perspective
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 70; // Moved back for better field of view

    // Renderer setup with optimized settings
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true, // Smoother edges
      powerPreference: 'high-performance' // Optimize for performance
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    containerRef.current.appendChild(renderer.domElement);

    // Create multiple particle systems with different properties
    const createParticleSystem = (count, size, color, speed, range) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const velocities = new Float32Array(count * 3); // Store velocities for more natural movement

      // Create particles with more natural distribution
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        // Use spherical distribution for more natural look
        const radius = Math.random() * range;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Random velocities for more varied movement
        velocities[i3] = (Math.random() - 0.5) * speed;
        velocities[i3 + 1] = (Math.random() - 0.5) * speed;
        velocities[i3 + 2] = (Math.random() - 0.5) * speed;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Create material with custom properties
      const material = new THREE.PointsMaterial({
        size,
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false, // Improve rendering performance
        vertexColors: false
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      return { particles, positions, velocities };
    };

    // Create multiple particle systems with different properties
    const particleSystems = [
      createParticleSystem(300, 0.15, '#8A2BE2', 0.01, 80), // Small violet particles
      createParticleSystem(200, 0.2, '#9370DB', 0.008, 70),  // Medium purple particles
      createParticleSystem(100, 0.25, '#BA55D3', 0.006, 60), // Larger orchid particles
      createParticleSystem(50, 0.3, '#DA70D6', 0.004, 50)    // Few large orchid particles
    ];

    // Handle resize with debounce for better performance
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }, 100);
    };

    window.addEventListener('resize', handleResize);

    // Mouse interaction with smoother tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const mouseMoveHandler = (event) => {
      // Calculate normalized mouse position
      targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    document.addEventListener('mousemove', mouseMoveHandler, { passive: true });

    // Animation loop with improved particle movement
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth mouse movement with lerp (linear interpolation)
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Update each particle system
      particleSystems.forEach((system, systemIndex) => {
        const { particles, velocities } = system;
        const positionAttribute = particles.geometry.getAttribute('position');
        const count = positionAttribute.count;

        // Apply different rotation to each system for varied effect
        particles.rotation.x += 0.0002 * (systemIndex + 1);
        particles.rotation.y += 0.0003 * (systemIndex + 1);

        // Apply mouse influence
        particles.rotation.x += mouseY * 0.0002 * (systemIndex + 1);
        particles.rotation.y += mouseX * 0.0003 * (systemIndex + 1);

        // Update individual particles for more organic movement
        for (let i = 0; i < count; i++) {
          const i3 = i * 3;

          // Apply velocity to position
          positionAttribute.array[i3] += velocities[i3];
          positionAttribute.array[i3 + 1] += velocities[i3 + 1];
          positionAttribute.array[i3 + 2] += velocities[i3 + 2];

          // Boundary check - wrap particles around if they go too far
          const limit = 80 - (systemIndex * 10); // Different limit for each system
          for (let j = 0; j < 3; j++) {
            if (Math.abs(positionAttribute.array[i3 + j]) > limit) {
              positionAttribute.array[i3 + j] *= -0.95; // Bounce back with damping
              velocities[i3 + j] *= -0.8; // Reverse velocity with damping
            }
          }
        }

        positionAttribute.needsUpdate = true; // Required to update positions
      });

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      // Cancel animation frame to prevent memory leaks
      cancelAnimationFrame(animate);

      // Remove event listeners
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', mouseMoveHandler);

      // Dispose of all resources to prevent memory leaks
      particleSystems.forEach(system => {
        system.particles.geometry.dispose();
        system.particles.material.dispose();
        scene.remove(system.particles);
      });

      // Remove renderer
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Clear references
      renderer.dispose();
    };
  }, [isInitialized]);

  return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none" />;
}