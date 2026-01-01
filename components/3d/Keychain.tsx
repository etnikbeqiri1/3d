'use client';

import { useRef, useMemo, useEffect, Suspense } from 'react';
import { useThree } from '@react-three/fiber';
import { Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import { useKeychainStore, TextElement, IconElement, PresetIconType, FrameStyle } from '@/lib/store';
import { getFontByName } from '@/lib/fonts';
import { svgPathToShapes, getPresetIconPath, parseSVGContent } from '@/lib/svg-icons';

// Scale factor: 1 unit = 10mm for better visibility in 3D
const SCALE = 0.1;

interface KeychainProps {
  onMeshReady?: (mesh: THREE.Group) => void;
}

export function Keychain({ onMeshReady }: KeychainProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const {
    mode,
    country,
    showEUFlag,
    countryOffsetX,
    countryOffsetY,
    countryDepth,
    euStarsDepth,
    style,
    width,
    height,
    thickness,
    baseColor,
    frameStyle,
    frameColor,
    frameWidth: frameWidthMm,
    holePosition,
    holeRadius,
    texts,
    icons,
  } = useKeychainStore();

  // Invalidate the canvas when any property changes
  useEffect(() => {
    invalidate();
  }, [mode, country, showEUFlag, countryOffsetX, countryOffsetY, countryDepth, euStarsDepth, style, width, height, thickness, baseColor, frameStyle, frameColor, frameWidthMm, holePosition, holeRadius, texts, icons, invalidate]);

  // Create base plate shape
  const baseShape = useMemo(() => {
    const w = width * SCALE;
    const h = height * SCALE;
    const shape = new THREE.Shape();

    // License plate mode
    if (mode === 'license_plate') {
      const radius = Math.min(w, h) * 0.08;
      const hr = holeRadius * SCALE;
      const tabRadius = hr + 0.15; // Circular tab around hole

      if (holePosition === 'left') {
        // License plate with circular tab on top-left corner
        // Just draw the rectangle - we'll add the circular tab as a separate mesh
        shape.moveTo(-w / 2 + radius, -h / 2);
        shape.lineTo(w / 2 - radius, -h / 2);
        shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + radius);
        shape.lineTo(w / 2, h / 2 - radius);
        shape.quadraticCurveTo(w / 2, h / 2, w / 2 - radius, h / 2);
        shape.lineTo(-w / 2 + radius, h / 2);
        shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - radius);
        shape.lineTo(-w / 2, -h / 2 + radius);
        shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + radius, -h / 2);
        // No hole in main shape - hole is in the tab
      } else {
        // Standard rectangle with rounded corners
        shape.moveTo(-w / 2 + radius, -h / 2);
        shape.lineTo(w / 2 - radius, -h / 2);
        shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + radius);
        shape.lineTo(w / 2, h / 2 - radius);
        shape.quadraticCurveTo(w / 2, h / 2, w / 2 - radius, h / 2);
        shape.lineTo(-w / 2 + radius, h / 2);
        shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - radius);
        shape.lineTo(-w / 2, -h / 2 + radius);
        shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + radius, -h / 2);

        // Add hole for other positions
        if (holePosition !== 'none') {
          const holePath = new THREE.Path();
          let holeX = 0, holeY = 0;
          if (holePosition === 'right') {
            holeX = w / 2 - hr - 0.1;
            holeY = 0;
          } else if (holePosition === 'top') {
            holeX = 0;
            holeY = h / 2 - hr - 0.1;
          }
          holePath.absarc(holeX, holeY, hr, 0, Math.PI * 2, true);
          shape.holes.push(holePath);
        }
      }
      return shape;
    } else {
      // Keychain mode - use selected style
      switch (style) {
        case 'circle': {
          const radius = Math.min(w, h) / 2;
          shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
          break;
        }

        case 'rectangle':
          shape.moveTo(-w / 2, -h / 2);
          shape.lineTo(w / 2, -h / 2);
          shape.lineTo(w / 2, h / 2);
          shape.lineTo(-w / 2, h / 2);
          shape.closePath();
          break;

        case 'rounded': {
          const radius = Math.min(w, h) * 0.15;
          shape.moveTo(-w / 2 + radius, -h / 2);
          shape.lineTo(w / 2 - radius, -h / 2);
          shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + radius);
          shape.lineTo(w / 2, h / 2 - radius);
          shape.quadraticCurveTo(w / 2, h / 2, w / 2 - radius, h / 2);
          shape.lineTo(-w / 2 + radius, h / 2);
          shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - radius);
          shape.lineTo(-w / 2, -h / 2 + radius);
          shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + radius, -h / 2);
          break;
        }

        case 'pill': {
          const radius = h / 2;
          shape.moveTo(-w / 2 + radius, -h / 2);
          shape.lineTo(w / 2 - radius, -h / 2);
          shape.arc(0, radius, radius, -Math.PI / 2, Math.PI / 2, false);
          shape.lineTo(-w / 2 + radius, h / 2);
          shape.arc(0, -radius, radius, Math.PI / 2, -Math.PI / 2, false);
          break;
        }

        case 'badge': {
          const r = Math.min(w, h) * 0.2;
          shape.moveTo(-w / 2 + r, -h / 2);
          shape.lineTo(w / 2 - r, -h / 2);
          shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
          shape.lineTo(w / 2, h / 2 - r);
          shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
          shape.lineTo(-w / 2 + r, h / 2);
          shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
          shape.lineTo(-w / 2, -h / 2 + r);
          shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
          break;
        }
      }
    }

    // Add keyring hole for keychain mode only (license plate handles its own holes)
    if (mode === 'keychain' && holePosition !== 'none') {
      const hr = holeRadius * SCALE;
      const holePath = new THREE.Path();
      let holeX = 0;
      let holeY = 0;

      // Calculate frame inset to prevent hole overlapping with frame
      let frameInset = 0;
      if (frameStyle !== 'none') {
        const fw = frameWidthMm * SCALE;
        if (frameStyle === 'simple') frameInset = fw * 1.5;
        else if (frameStyle === 'double') frameInset = fw * 2.5;
        else if (frameStyle === 'ridge') frameInset = fw * 2;
      }

      const baseInset = 0.1 + frameInset;

      switch (holePosition) {
        case 'left':
          holeX = -w / 2 + hr + baseInset;
          holeY = 0;
          break;
        case 'right':
          holeX = w / 2 - hr - baseInset;
          holeY = 0;
          break;
        case 'top':
          holeX = 0;
          holeY = h / 2 - hr - baseInset;
          break;
      }

      holePath.absarc(holeX, holeY, hr, 0, Math.PI * 2, true);
      shape.holes.push(holePath);
    }

    return shape;
  }, [mode, width, height, style, holePosition, holeRadius, frameStyle, frameWidthMm]);

  // Extrusion settings
  const extrudeSettings = useMemo(
    () => ({
      depth: thickness * SCALE,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 64,
    }),
    [thickness]
  );

  // Notify parent when mesh is ready
  useEffect(() => {
    if (groupRef.current && onMeshReady) {
      onMeshReady(groupRef.current);
    }
  }, [texts, icons, onMeshReady]);

  // Calculate the Z position for elements
  // Elements should embed slightly INTO the base for proper 3D printing connection
  const baseTopZ = (thickness * SCALE) / 2;
  const embedDepth = 0.03; // Embed elements 0.3mm into base for solid connection

  // Circular tab shape for license plate hole (when hole is on left)
  const tabShape = useMemo(() => {
    if (mode !== 'license_plate' || holePosition !== 'left') return null;

    const w = width * SCALE;
    const h = height * SCALE;
    const hr = holeRadius * SCALE;
    const tabRadius = hr + 0.15;
    const tabCenterX = -w / 2 + tabRadius * 0.8;
    const tabCenterY = h / 2 + tabRadius * 0.5;

    const tab = new THREE.Shape();
    tab.absarc(tabCenterX, tabCenterY, tabRadius, 0, Math.PI * 2, false);

    // Cut hole in the tab
    const holePath = new THREE.Path();
    holePath.absarc(tabCenterX, tabCenterY, hr, 0, Math.PI * 2, true);
    tab.holes.push(holePath);

    return { shape: tab, centerX: tabCenterX, centerY: tabCenterY };
  }, [mode, width, height, holePosition, holeRadius]);

  // EU stripe shape for license plates
  const euStripeShape = useMemo(() => {
    if (mode !== 'license_plate') return null;

    const w = width * SCALE;
    const h = height * SCALE;
    // EU stripe is narrow - about 8% of plate width
    const stripeWidth = w * 0.12;
    const radius = Math.min(w, h) * 0.08;

    const stripe = new THREE.Shape();
    stripe.moveTo(-w / 2 + radius, -h / 2);
    stripe.lineTo(-w / 2 + stripeWidth, -h / 2);
    stripe.lineTo(-w / 2 + stripeWidth, h / 2);
    stripe.lineTo(-w / 2 + radius, h / 2);
    stripe.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - radius);
    stripe.lineTo(-w / 2, -h / 2 + radius);
    stripe.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + radius, -h / 2);

    return stripe;
  }, [mode, width, height]);

  // Frame shape for keychain mode
  const frameData = useMemo(() => {
    if (mode !== 'keychain' || frameStyle === 'none') return null;

    const w = width * SCALE;
    const h = height * SCALE;
    const fw = frameWidthMm * SCALE;
    const frameDepth = 0.05;

    // Helper to create a path at a given inset
    const createFramePath = (inset: number): THREE.Shape => {
      const path = new THREE.Shape();
      const iw = w - inset * 2;
      const ih = h - inset * 2;

      if (style === 'circle') {
        const r = Math.min(iw, ih) / 2;
        path.absarc(0, 0, r, 0, Math.PI * 2, false);
      } else if (style === 'pill') {
        const r = ih / 2;
        path.moveTo(-iw / 2 + r, -ih / 2);
        path.lineTo(iw / 2 - r, -ih / 2);
        path.absarc(iw / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2, false);
        path.lineTo(-iw / 2 + r, ih / 2);
        path.absarc(-iw / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2, false);
      } else if (style === 'rounded' || style === 'badge') {
        const r = Math.min(iw, ih) * 0.15;
        path.moveTo(-iw / 2 + r, -ih / 2);
        path.lineTo(iw / 2 - r, -ih / 2);
        path.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + r);
        path.lineTo(iw / 2, ih / 2 - r);
        path.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - r, ih / 2);
        path.lineTo(-iw / 2 + r, ih / 2);
        path.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - r);
        path.lineTo(-iw / 2, -ih / 2 + r);
        path.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + r, -ih / 2);
      } else {
        path.moveTo(-iw / 2, -ih / 2);
        path.lineTo(iw / 2, -ih / 2);
        path.lineTo(iw / 2, ih / 2);
        path.lineTo(-iw / 2, ih / 2);
        path.closePath();
      }
      return path;
    };

    const frames: { shape: THREE.Shape; depth: number; zOffset: number }[] = [];

    if (frameStyle === 'simple') {
      const outer = createFramePath(fw * 0.5);
      outer.holes.push(createFramePath(fw * 1.5) as THREE.Path);
      frames.push({ shape: outer, depth: frameDepth, zOffset: 0 });
    } else if (frameStyle === 'double') {
      const outer1 = createFramePath(fw * 0.3);
      outer1.holes.push(createFramePath(fw * 0.8) as THREE.Path);
      frames.push({ shape: outer1, depth: frameDepth, zOffset: 0 });

      const outer2 = createFramePath(fw * 1.3);
      outer2.holes.push(createFramePath(fw * 1.8) as THREE.Path);
      frames.push({ shape: outer2, depth: frameDepth * 0.7, zOffset: 0 });
    } else if (frameStyle === 'ridge') {
      const outer = createFramePath(fw * 0.3);
      outer.holes.push(createFramePath(fw * 1.5) as THREE.Path);
      frames.push({ shape: outer, depth: frameDepth * 1.2, zOffset: 0 });
    }

    return frames;
  }, [mode, frameStyle, style, width, height, frameWidthMm]);

  return (
    <group ref={groupRef}>
      {/* Base plate */}
      <mesh position={[0, 0, -baseTopZ]}>
        <extrudeGeometry args={[baseShape, extrudeSettings]} />
        <meshStandardMaterial color={baseColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Frame elements */}
      {frameData && frameData.map((frame, idx) => (
        <mesh key={`frame-${idx}`} position={[0, 0, baseTopZ + frame.zOffset]}>
          <extrudeGeometry args={[frame.shape, { depth: frame.depth, bevelEnabled: false, curveSegments: 64 }]} />
          <meshStandardMaterial
            color={frameColor}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Circular tab for hole (license plate with left hole) */}
      {tabShape && (
        <mesh position={[0, 0, -baseTopZ]}>
          <extrudeGeometry args={[tabShape.shape, extrudeSettings]} />
          <meshStandardMaterial color={baseColor} metalness={0.3} roughness={0.4} />
        </mesh>
      )}

      {/* EU Blue Stripe for license plates - on top of base */}
      {mode === 'license_plate' && euStripeShape && (
        <>
          <mesh position={[0, 0, baseTopZ - embedDepth]}>
            <extrudeGeometry
              args={[
                euStripeShape,
                {
                  depth: 0.08,
                  bevelEnabled: false,
                },
              ]}
            />
            <meshStandardMaterial color="#003399" metalness={0.2} roughness={0.5} />
          </mesh>

          {/* EU Stars circle above country code - only shown if showEUFlag is true */}
          {showEUFlag && (
            <EUStars
              centerX={-width * SCALE / 2 + (width * SCALE * 0.12) / 2 + countryOffsetX * SCALE}
              centerY={height * SCALE * 0.25 + countryOffsetY * SCALE}
              radius={width * SCALE * 0.035}
              baseTopZ={baseTopZ + 0.05}
              depth={euStarsDepth * SCALE}
            />
          )}

          {/* Country code on the stripe - size based on letter count */}
          <Suspense fallback={null}>
            <Center
              position={[
                -width * SCALE / 2 + (width * SCALE * 0.12) / 2 + countryOffsetX * SCALE,
                (showEUFlag ? -height * SCALE * 0.2 : 0) + countryOffsetY * SCALE,
                baseTopZ + 0.05,
              ]}
            >
              <Text3D
                font="/fonts/din1451.typeface.json"
                size={
                  country.length === 1
                    ? width * SCALE * 0.065
                    : country.length === 2
                    ? width * SCALE * 0.045
                    : width * SCALE * 0.032
                }
                height={countryDepth * SCALE}
                bevelEnabled={false}
              >
                {country}
                <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} />
              </Text3D>
            </Center>
          </Suspense>
        </>
      )}

      {/* Multiple 3D Texts - embedded into base */}
      {texts.map((textEl) => (
        <TextMesh key={textEl.id} textElement={textEl} baseTopZ={baseTopZ - embedDepth} />
      ))}

      {/* Multiple Icons - embedded into base (keychain mode only) */}
      {mode === 'keychain' && icons.map((iconEl) => (
        <IconMesh key={iconEl.id} iconElement={iconEl} baseTopZ={baseTopZ - embedDepth} />
      ))}
    </group>
  );
}

// Individual text mesh component
function TextMesh({ textElement, baseTopZ }: { textElement: TextElement; baseTopZ: number }) {
  const fontPath = useMemo(() => {
    const fontConfig = getFontByName(textElement.font);
    return fontConfig?.path || '/fonts/helvetiker_regular.typeface.json';
  }, [textElement.font]);

  // Convert degrees to radians
  const rotateZ = (textElement.rotateZ ?? 0) * (Math.PI / 180);
  const tiltX = (textElement.tiltX ?? 0) * (Math.PI / 180);
  const tiltY = (textElement.tiltY ?? 0) * (Math.PI / 180);

  if (!textElement.text) return null;

  return (
    <Suspense fallback={null}>
      <group
        position={[textElement.offsetX * SCALE, textElement.offsetY * SCALE, baseTopZ]}
        rotation={[tiltX, tiltY, rotateZ]}
      >
        <Center>
          <Text3D
            font={fontPath}
            size={textElement.fontSize * SCALE}
            height={textElement.depth * SCALE}
            bevelEnabled
            bevelThickness={0.01}
            bevelSize={0.005}
            bevelSegments={2}
          >
            {textElement.text}
            <meshStandardMaterial color={textElement.color} metalness={0.5} roughness={0.3} />
          </Text3D>
        </Center>
      </group>
    </Suspense>
  );
}

// Icon mesh component with customizable properties - uses SVG paths for all icons
function IconMesh({ iconElement, baseTopZ }: { iconElement: IconElement; baseTopZ: number }) {
  const shapes = useMemo(() => {
    const targetSize = iconElement.size * SCALE;

    try {
      // For custom icons, svgPath contains full SVG content
      if (iconElement.type === 'custom' && iconElement.svgPath) {
        return parseSVGContent(iconElement.svgPath, targetSize);
      }

      // For preset icons, get the path data
      const svgPath = getPresetIconPath(iconElement.type);
      if (svgPath) {
        return svgPathToShapes(svgPath, targetSize);
      }
    } catch (error) {
      console.error('Error parsing icon:', error);
    }

    // Fallback to a simple circle if no path found
    const fallback = new THREE.Shape();
    fallback.absarc(0, 0, targetSize / 2, 0, Math.PI * 2, false);
    return [fallback];
  }, [iconElement.type, iconElement.size, iconElement.svgPath]);

  // Convert degrees to radians
  const rotateZ = (iconElement.rotateZ ?? 0) * (Math.PI / 180);
  const tiltX = (iconElement.tiltX ?? 0) * (Math.PI / 180);
  const tiltY = (iconElement.tiltY ?? 0) * (Math.PI / 180);

  const extrudeSettings = useMemo(() => ({
    depth: iconElement.depth * SCALE,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.005,
    curveSegments: 32,
  }), [iconElement.depth]);

  return (
    <group
      position={[iconElement.offsetX * SCALE, iconElement.offsetY * SCALE, baseTopZ]}
      rotation={[tiltX, tiltY, rotateZ]}
    >
      {shapes.map((shape, index) => (
        <mesh key={index}>
          <extrudeGeometry args={[shape, extrudeSettings]} />
          <meshStandardMaterial color={iconElement.color} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// EU Stars component - 12 stars in a circle
function EUStars({
  centerX,
  centerY,
  radius,
  baseTopZ,
  depth = 0.03,
}: {
  centerX: number;
  centerY: number;
  radius: number;
  baseTopZ: number;
  depth?: number;
}) {
  const stars = useMemo(() => {
    const result: { x: number; y: number }[] = [];
    const numStars = 12;
    for (let i = 0; i < numStars; i++) {
      const angle = (i * Math.PI * 2) / numStars - Math.PI / 2;
      result.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }
    return result;
  }, [centerX, centerY, radius]);

  const starShape = useMemo(() => {
    const s = new THREE.Shape();
    const size = radius * 0.18;
    const outerR = size;
    const innerR = size * 0.4;
    for (let i = 0; i < 5; i++) {
      const outerAngle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const innerAngle = outerAngle + Math.PI / 5;
      if (i === 0) {
        s.moveTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
      } else {
        s.lineTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
      }
      s.lineTo(Math.cos(innerAngle) * innerR, Math.sin(innerAngle) * innerR);
    }
    s.closePath();
    return s;
  }, [radius]);

  return (
    <group>
      {stars.map((star, i) => (
        <mesh key={i} position={[star.x, star.y, baseTopZ]}>
          <extrudeGeometry
            args={[
              starShape,
              {
                depth: depth,
                bevelEnabled: false,
              },
            ]}
          />
          <meshStandardMaterial color="#FFCC00" metalness={0.3} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export default Keychain;
