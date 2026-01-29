
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleField = () => {
  const count = 5000;
  const mesh = useRef(null);

  // Generate a circular texture
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.arc(32, 32, 30, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  const colors = useMemo(() => {
    const palette = [
      new THREE.Color('#676A72'),
      new THREE.Color('#FF4641'),
      new THREE.Color('#346BF1'),
      new THREE.Color('#4ADE80'),
      new THREE.Color('#FACC15')
    ];
    const colorArray = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      color.toArray(colorArray, i * 3);
    }
    return colorArray;
  }, []);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      const pos = mesh.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        // Slow vertical descent
        pos[i * 3 + 1] -= 0.005;

        // Horizontal sway (drift) for flake effect
        pos[i * 3] += Math.sin(time + i) * 0.005;
        pos[i * 3 + 2] += Math.cos(time + i) * 0.005;

        // Reset to top if it goes below bounds
        if (pos[i * 3 + 1] < -15) {
          pos[i * 3 + 1] = 15;
          pos[i * 3] = (Math.random() - 0.5) * 30;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.13}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        map={circleTexture}
        alphaTest={0.5}
      />
    </points>
  );
};

export const BackgroundParticles = () => {
  return (
    <div style={{
      position: 'fixed', // Changed to fixed to ensure it covers viewport
      top: 0,
      left: 0,
      width: '100vw',    // Explicit viewport units
      height: '100vh',   // Explicit viewport units
      zIndex: -1,
      pointerEvents: 'none'
    }}>
      <Canvas camera={{ position: [0, 0, 8.8], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <ParticleField />
      </Canvas>
    </div>
  );
};
