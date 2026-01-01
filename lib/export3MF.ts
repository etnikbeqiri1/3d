import * as THREE from 'three';
import JSZip from 'jszip';

// Scale factor used in the 3D scene (1 unit = 10mm)
const EXPORT_SCALE = 10;

interface MeshData {
  vertices: number[];
  triangles: number[];
  color: string;
  name: string;
}

/**
 * Round vertex coordinates to avoid floating point precision issues
 */
function roundVertex(value: number): number {
  return Math.round(value * 10000) / 10000;
}

/**
 * Compute geometry normals and ensure consistent winding order
 */
function ensureConsistentWindingOrder(geometry: THREE.BufferGeometry): void {
  geometry.computeVertexNormals();
}

/**
 * Extract all meshes with their colors from a Three.js group
 * with proper geometry handling for 3D printing
 */
function extractMeshes(group: THREE.Object3D): MeshData[] {
  const meshes: MeshData[] = [];
  let meshIndex = 0;

  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      const geometry = child.geometry.clone();

      // Apply world matrix to geometry
      child.updateWorldMatrix(true, false);
      geometry.applyMatrix4(child.matrixWorld);

      // Ensure consistent normals
      ensureConsistentWindingOrder(geometry);

      // Convert to non-indexed geometry to avoid shared vertex issues
      const nonIndexedGeometry = geometry.index ? geometry.toNonIndexed() : geometry;

      const position = nonIndexedGeometry.getAttribute('position');
      if (!position) return;

      // Build unique vertex list with deduplication
      const vertexMap = new Map<string, number>();
      const vertices: number[] = [];
      const triangles: number[] = [];

      for (let i = 0; i < position.count; i += 3) {
        const triIndices: number[] = [];

        for (let j = 0; j < 3; j++) {
          const idx = i + j;
          const x = roundVertex(position.getX(idx) * EXPORT_SCALE);
          const y = roundVertex(position.getY(idx) * EXPORT_SCALE);
          const z = roundVertex(position.getZ(idx) * EXPORT_SCALE);

          const key = `${x},${y},${z}`;

          if (!vertexMap.has(key)) {
            const vertexIndex = vertices.length / 3;
            vertexMap.set(key, vertexIndex);
            vertices.push(x, y, z);
          }

          triIndices.push(vertexMap.get(key)!);
        }

        // Only add triangle if all three vertices are different (avoid degenerate triangles)
        if (triIndices[0] !== triIndices[1] &&
            triIndices[1] !== triIndices[2] &&
            triIndices[0] !== triIndices[2]) {
          triangles.push(triIndices[0], triIndices[1], triIndices[2]);
        }
      }

      // Skip empty meshes
      if (vertices.length === 0 || triangles.length === 0) return;

      // Get color from material
      let color = '#808080';
      if (child.material instanceof THREE.MeshStandardMaterial) {
        color = '#' + child.material.color.getHexString();
      }

      // Determine name
      const name = meshIndex === 0 ? 'Base' : `Part_${meshIndex}`;

      meshes.push({ vertices, triangles, color, name });
      meshIndex++;
    }
  });

  return meshes;
}

/**
 * Export Three.js group to 3MF format compatible with Bambu Studio
 * Each mesh is exported as a separate object for proper multi-color support
 */
export async function exportTo3MF(
  group: THREE.Object3D,
  filename: string = 'keychain'
): Promise<void> {
  const meshes = extractMeshes(group);

  if (meshes.length === 0) {
    console.error('No meshes found to export');
    return;
  }

  // Find the minimum Z coordinate across all meshes to place model on build plate
  let minZ = Infinity;
  meshes.forEach(mesh => {
    for (let i = 2; i < mesh.vertices.length; i += 3) {
      if (mesh.vertices[i] < minZ) {
        minZ = mesh.vertices[i];
      }
    }
  });

  // Shift all vertices so the model sits on the build plate (Z >= 0)
  if (minZ !== Infinity && minZ !== 0) {
    meshes.forEach(mesh => {
      for (let i = 2; i < mesh.vertices.length; i += 3) {
        mesh.vertices[i] -= minZ;
      }
    });
  }

  // Collect unique colors
  const uniqueColors: string[] = [];
  meshes.forEach(mesh => {
    if (!uniqueColors.includes(mesh.color)) {
      uniqueColors.push(mesh.color);
    }
  });

  // Build basematerials XML
  let baseMaterialsXml = '';
  uniqueColors.forEach((color, idx) => {
    baseMaterialsXml += `      <base name="Material_${idx}" displaycolor="${color.toUpperCase()}" />\n`;
  });

  // Build separate objects for each mesh
  let objectsXml = '';
  let buildItemsXml = '';
  let objectSettingsXml = '';
  let objectId = 2; // Start from 2 (1 is basematerials)
  let extruderIndex = 1; // Start with extruder 1

  meshes.forEach((mesh) => {
    const colorIndex = uniqueColors.indexOf(mesh.color);

    // Build vertices XML
    let verticesXml = '';
    for (let i = 0; i < mesh.vertices.length; i += 3) {
      const x = mesh.vertices[i].toFixed(4);
      const y = mesh.vertices[i + 1].toFixed(4);
      const z = mesh.vertices[i + 2].toFixed(4);
      verticesXml += `          <vertex x="${x}" y="${y}" z="${z}" />\n`;
    }

    // Build triangles XML with material reference
    let trianglesXml = '';
    for (let i = 0; i < mesh.triangles.length; i += 3) {
      const v1 = mesh.triangles[i];
      const v2 = mesh.triangles[i + 1];
      const v3 = mesh.triangles[i + 2];
      trianglesXml += `          <triangle v1="${v1}" v2="${v2}" v3="${v3}" pid="1" p1="${colorIndex}" />\n`;
    }

    objectsXml += `    <object id="${objectId}" name="${mesh.name}" type="model">
      <mesh>
        <vertices>
${verticesXml}        </vertices>
        <triangles>
${trianglesXml}        </triangles>
      </mesh>
    </object>\n`;

    buildItemsXml += `    <item objectid="${objectId}" printable="1" />\n`;

    // Bambu Studio object settings - assign each part to different extruder
    objectSettingsXml += `  <object id="${objectId}">
    <metadata key="name" value="${mesh.name}"/>
    <metadata key="extruder" value="${extruderIndex}"/>
  </object>\n`;

    objectId++;
    extruderIndex++; // Each part gets next extruder slot
  });

  // Create 3MF model XML with Bambu Studio compatible namespaces
  const modelXml = `<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US"
  xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"
  xmlns:m="http://schemas.microsoft.com/3dmanufacturing/material/2015/02"
  xmlns:slic3rpe="http://schemas.slic3r.org/3mf/2017/06"
  xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06">
  <metadata name="Title">${filename}</metadata>
  <metadata name="Designer">Keychain Generator</metadata>
  <metadata name="CreationDate">${new Date().toISOString().split('T')[0]}</metadata>
  <metadata name="Application">BambuStudio</metadata>
  <metadata name="slic3rpe:Version3mf">1</metadata>
  <metadata name="BambuStudio:3mfVersion">1</metadata>
  <resources>
    <basematerials id="1">
${baseMaterialsXml}    </basematerials>
${objectsXml}  </resources>
  <build>
${buildItemsXml}  </build>
</model>`;

  // Create Bambu Studio / Slic3r PE model config (assigns extruders to parts)
  // This format is recognized by Bambu Studio
  const slicerModelConfig = `<?xml version="1.0" encoding="UTF-8"?>
<config>
${objectSettingsXml}</config>`;

  // Create project config with unit settings for Bambu Studio
  const projectConfig = `<?xml version="1.0" encoding="UTF-8"?>
<config>
  <header>
    <header_item key="PrusaSlicerVersion" value="2.6.0"/>
    <header_item key="BambuStudio_3mf_version" value="1"/>
  </header>
</config>`;

  // Create content types XML (includes config files)
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml" />
  <Default Extension="config" ContentType="text/xml" />
</Types>`;

  // Create relationships XML
  const relsXml = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel" />
</Relationships>`;

  // Create ZIP (3MF is a ZIP archive)
  const zip = new JSZip();
  zip.file('[Content_Types].xml', contentTypesXml);
  zip.folder('_rels')!.file('.rels', relsXml);
  zip.folder('3D')!.file('3dmodel.model', modelXml);
  // Add both config file formats for maximum compatibility
  zip.folder('Metadata')!.file('Slic3r_PE_model.config', slicerModelConfig);
  zip.folder('Metadata')!.file('model_settings.config', slicerModelConfig);
  zip.folder('Metadata')!.file('project_settings.config', projectConfig);

  // Generate and download
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.3mf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
