import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

// Preset icon SVG paths (viewBox 0 0 24 24)
export const ICON_SVG_PATHS: Record<string, string> = {
  heart: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  paw: 'M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-3 14c-1.66 0-3 1.34-3 3h12c0-1.66-1.34-3-3-3h-6z',
  music: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
  crown: 'M2 19h20v3H2v-3zm2-5l3-8 5 5 5-5 3 8H4zm8-12l2.5 5h-5L12 2z',
  smiley: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c.78 2.34 2.72 4 5 4s4.22-1.66 5-4H7zm1-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z',
  diamond: 'M12 2L2 12l10 10 10-10L12 2zm0 3.5L18.5 12 12 18.5 5.5 12 12 5.5z',
  bolt: 'M7 2v11h3v9l7-12h-4l4-8z',
  moon: 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z',
  sun: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z',
};

// SVGLoader instance (reused)
const svgLoader = new SVGLoader();

// Parse SVG content using Three.js SVGLoader and return shapes
export function svgToShapes(svgContent: string, targetSize: number = 1): THREE.Shape[] {
  try {
    const data = svgLoader.parse(svgContent);
    const allShapes: THREE.Shape[] = [];

    // Get bounding box of all paths
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    data.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const points = shape.getPoints();
        points.forEach((p) => {
          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y);
        });
      });
    });

    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const scale = targetSize / Math.max(width, height);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Process each path
    data.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);

      shapes.forEach((shape) => {
        // Transform the shape: center and scale
        const transformedShape = new THREE.Shape();
        const points = shape.getPoints();

        if (points.length > 0) {
          transformedShape.moveTo(
            (points[0].x - centerX) * scale,
            -(points[0].y - centerY) * scale // Flip Y
          );

          for (let i = 1; i < points.length; i++) {
            transformedShape.lineTo(
              (points[i].x - centerX) * scale,
              -(points[i].y - centerY) * scale
            );
          }
          transformedShape.closePath();
        }

        // Handle holes
        if (shape.holes && shape.holes.length > 0) {
          shape.holes.forEach((hole) => {
            const holePoints = hole.getPoints();
            if (holePoints.length > 0) {
              const transformedHole = new THREE.Path();
              transformedHole.moveTo(
                (holePoints[0].x - centerX) * scale,
                -(holePoints[0].y - centerY) * scale
              );

              for (let i = 1; i < holePoints.length; i++) {
                transformedHole.lineTo(
                  (holePoints[i].x - centerX) * scale,
                  -(holePoints[i].y - centerY) * scale
                );
              }
              transformedHole.closePath();
              transformedShape.holes.push(transformedHole);
            }
          });
        }

        if (points.length >= 3) {
          allShapes.push(transformedShape);
        }
      });
    });

    if (allShapes.length === 0) {
      // Fallback circle
      const fallback = new THREE.Shape();
      fallback.absarc(0, 0, targetSize / 2, 0, Math.PI * 2, false);
      return [fallback];
    }

    return allShapes;
  } catch (error) {
    console.error('Error parsing SVG:', error);
    const fallback = new THREE.Shape();
    fallback.absarc(0, 0, targetSize / 2, 0, Math.PI * 2, false);
    return [fallback];
  }
}

// Convert a single SVG path string to shapes (for preset icons)
export function svgPathToShapes(pathData: string, targetSize: number = 1): THREE.Shape[] {
  // Wrap path in SVG element for SVGLoader
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${pathData}"/></svg>`;
  return svgToShapes(svgContent, targetSize);
}

// For backwards compatibility - returns first shape
export function svgPathToShape(pathData: string, targetSize: number = 1): THREE.Shape {
  const shapes = svgPathToShapes(pathData, targetSize);
  return shapes[0];
}

// Extract path data from SVG file content - now returns the full SVG content
export function extractPathsFromSVG(svgContent: string): string {
  // Return the full SVG content so SVGLoader can parse it properly
  return svgContent;
}

// Get SVG path for a preset icon type
export function getPresetIconPath(type: string): string | null {
  return ICON_SVG_PATHS[type] || null;
}

// Parse full SVG content (from file upload) to shapes
export function parseSVGContent(svgContent: string, targetSize: number = 1): THREE.Shape[] {
  return svgToShapes(svgContent, targetSize);
}
