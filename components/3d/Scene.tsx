'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Keychain } from './Keychain';

interface SceneProps {
  onMeshReady?: (mesh: THREE.Group) => void;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 0.5, 0.1]} />
      <meshStandardMaterial color="#cccccc" />
    </mesh>
  );
}

export function Scene({ onMeshReady }: SceneProps) {
  const [canvasKey, setCanvasKey] = useState(0);
  const [contextLost, setContextLost] = useState(false);

  const handleCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost, will attempt recovery...');
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
      setContextLost(false);
      setCanvasKey((k) => k + 1);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  useEffect(() => {
    if (contextLost) {
      const timer = setTimeout(() => {
        setContextLost(false);
        setCanvasKey((k) => k + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [contextLost]);

  if (contextLost) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-foreground border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Recovering 3D view...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full">
      <Canvas
        key={canvasKey}
        shadows
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{
          antialias: true,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
          preserveDrawingBuffer: true,
        }}
        onCreated={handleCreated}
        style={{ background: 'black' }}
      >
        <color attach="background" args={['#000000']} />

        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={45} />

        {/* Background effects - multiple star layers for size variation */}
        <Stars radius={100} depth={80} count={1000} factor={2} saturation={0} fade speed={0.3} />
        <Stars radius={80} depth={60} count={500} factor={5} saturation={0} fade speed={0.5} />
        <Stars radius={60} depth={40} count={200} factor={8} saturation={0} fade speed={0.7} />

        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[-5, 3, -5]} intensity={0.8} />
        <directionalLight position={[0, -5, 5]} intensity={0.5} />
        <hemisphereLight args={['#ffffff', '#444444', 0.5]} />

        {/* Colored accent lights */}
        <pointLight position={[-8, 2, 3]} color="#a855f7" intensity={8} distance={25} />
        <pointLight position={[8, 2, 3]} color="#3b82f6" intensity={8} distance={25} />
        <pointLight position={[0, 5, -5]} color="#22d3ee" intensity={5} distance={20} />

        <Suspense fallback={<LoadingFallback />}>
          <Keychain onMeshReady={onMeshReady} />
        </Suspense>

        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.3}
          scale={8}
          blur={2}
          far={3}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={30}
          autoRotate={false}
          makeDefault
        />

        <gridHelper args={[10, 10, '#1a1a2e', '#0f0f1a']} position={[0, -1.5, 0]} />

        {/* Post-processing effects */}
        <EffectComposer>
          <Bloom
            intensity={2}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.99}
            radius={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default Scene;
