'use client';

import { useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { ControlPanel } from './ui/ControlPanel';
import { exportToSTL } from '@/lib/exportSTL';
import { exportTo3MF } from '@/lib/export3MF';
import { useKeychainStore, GeneratorMode } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Scene = dynamic(() => import('./3d/Scene'), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-neutral-700 border-t-white" />
        <span className="text-sm text-neutral-400">Loading 3D Preview...</span>
      </div>
    </div>
  ),
});

export function KeychainGenerator() {
  const meshRef = useRef<THREE.Group | null>(null);
  const { texts, mode, setMode } = useKeychainStore();

  const handleMeshReady = useCallback((mesh: THREE.Group) => {
    meshRef.current = mesh;
  }, []);

  const getFilename = useCallback(() => {
    const firstText = texts[0]?.text || 'custom';
    return `keychain_${firstText.toLowerCase().replace(/\s+/g, '_')}`;
  }, [texts]);

  const handleExport = useCallback(() => {
    if (meshRef.current) {
      exportToSTL(meshRef.current, { filename: getFilename(), binary: true });
    } else {
      console.warn('Mesh not ready for export');
    }
  }, [getFilename]);

  const handleExport3MF = useCallback(() => {
    if (meshRef.current) {
      exportTo3MF(meshRef.current, getFilename());
    } else {
      console.warn('Mesh not ready for export');
    }
  }, [getFilename]);

  return (
    <div className="flex h-screen gap-4 p-4 bg-background">
      <Card className="flex-1 min-w-0 overflow-hidden bg-black p-0">
        <Scene onMeshReady={handleMeshReady} />
      </Card>
      <div className="w-96 shrink-0 flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              variant="outline"
              value={mode}
              onValueChange={(value) => value && setMode(value as GeneratorMode)}
              className="flex w-full"
            >
              <ToggleGroupItem value="keychain" variant="outline" className="flex-1">
                Keychain
              </ToggleGroupItem>
              <ToggleGroupItem value="license_plate" variant="outline" className="flex-1">
                License Plate
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
        <Card className="flex-1 min-h-0 overflow-hidden">
          <ControlPanel onExport={handleExport} onExport3MF={handleExport3MF} />
        </Card>
      </div>
    </div>
  );
}

export default KeychainGenerator;
