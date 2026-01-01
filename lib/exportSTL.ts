import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

// Scale factor used in the 3D scene (1 unit = 10mm)
// We need to multiply by 10 to get back to millimeters
const EXPORT_SCALE = 10;

interface ExportOptions {
  binary?: boolean;
  filename?: string;
}

/**
 * Export a Three.js mesh/group to STL file and trigger download
 */
export function exportToSTL(
  object: THREE.Object3D,
  options: ExportOptions = {}
): void {
  const { binary = true, filename = 'keychain' } = options;

  const exporter = new STLExporter();

  // Clone the object to avoid modifying the original
  const clone = object.clone();

  // Reset rotation for proper export orientation
  clone.rotation.set(0, 0, 0);

  // Scale up to millimeters
  clone.scale.set(EXPORT_SCALE, EXPORT_SCALE, EXPORT_SCALE);
  clone.updateMatrixWorld(true);

  // Export to STL
  const result = exporter.parse(clone, { binary });

  // Create blob and download
  let blob: Blob;
  if (binary) {
    // For binary, result is a DataView - extract the ArrayBuffer
    const dataView = result as DataView;
    blob = new Blob([new Uint8Array(dataView.buffer as ArrayBuffer)], { type: 'application/octet-stream' });
  } else {
    blob = new Blob([result as string], { type: 'text/plain' });
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.stl`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export multiple parts as separate STL files (for multi-color printing)
 * Returns a promise that resolves when all files are downloaded
 */
export async function exportMultiColorSTL(
  baseMesh: THREE.Object3D,
  textMesh: THREE.Object3D | null,
  iconMesh: THREE.Object3D | null,
  baseFilename: string = 'keychain'
): Promise<void> {
  const exporter = new STLExporter();

  const downloadPart = (mesh: THREE.Object3D, suffix: string) => {
    const clone = mesh.clone();
    clone.rotation.set(0, 0, 0);
    clone.updateMatrixWorld(true);

    const result = exporter.parse(clone, { binary: true });
    const dataView = result as DataView;
    const blob = new Blob([new Uint8Array(dataView.buffer as ArrayBuffer)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}_${suffix}.stl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download base
  downloadPart(baseMesh, 'base');

  // Small delay between downloads
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Download text if present
  if (textMesh) {
    downloadPart(textMesh, 'text');
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Download icon if present
  if (iconMesh) {
    downloadPart(iconMesh, 'icon');
  }
}

/**
 * Merge all child meshes into a single geometry for export
 */
export function mergeGroupGeometries(group: THREE.Group): THREE.BufferGeometry | null {
  const geometries: THREE.BufferGeometry[] = [];
  const matrix = new THREE.Matrix4();

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const clonedGeometry = child.geometry.clone();
      child.updateWorldMatrix(true, false);
      clonedGeometry.applyMatrix4(child.matrixWorld);
      geometries.push(clonedGeometry);
    }
  });

  if (geometries.length === 0) return null;

  // Use BufferGeometryUtils to merge
  const { mergeGeometries } = require('three/examples/jsm/utils/BufferGeometryUtils.js');
  return mergeGeometries(geometries);
}
