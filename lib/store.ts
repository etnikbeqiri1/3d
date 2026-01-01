import { create } from 'zustand';

export type GeneratorMode = 'keychain' | 'license_plate';
export type KeychainStyle = 'rectangle' | 'rounded' | 'pill' | 'badge' | 'circle';
export type HolePosition = 'left' | 'right' | 'top' | 'none';

// EU Countries for license plates (inEU = true means they use EU flag with stars)
export const EU_COUNTRIES = [
  // EU Member States
  { code: 'A', name: 'Austria', inEU: true },
  { code: 'B', name: 'Belgium', inEU: true },
  { code: 'BG', name: 'Bulgaria', inEU: true },
  { code: 'HR', name: 'Croatia', inEU: true },
  { code: 'CY', name: 'Cyprus', inEU: true },
  { code: 'CZ', name: 'Czech Republic', inEU: true },
  { code: 'DK', name: 'Denmark', inEU: true },
  { code: 'EST', name: 'Estonia', inEU: true },
  { code: 'FIN', name: 'Finland', inEU: true },
  { code: 'F', name: 'France', inEU: true },
  { code: 'D', name: 'Germany', inEU: true },
  { code: 'GR', name: 'Greece', inEU: true },
  { code: 'H', name: 'Hungary', inEU: true },
  { code: 'IRL', name: 'Ireland', inEU: true },
  { code: 'I', name: 'Italy', inEU: true },
  { code: 'LV', name: 'Latvia', inEU: true },
  { code: 'LT', name: 'Lithuania', inEU: true },
  { code: 'L', name: 'Luxembourg', inEU: true },
  { code: 'M', name: 'Malta', inEU: true },
  { code: 'NL', name: 'Netherlands', inEU: true },
  { code: 'PL', name: 'Poland', inEU: true },
  { code: 'P', name: 'Portugal', inEU: true },
  { code: 'RO', name: 'Romania', inEU: true },
  { code: 'SK', name: 'Slovakia', inEU: true },
  { code: 'SLO', name: 'Slovenia', inEU: true },
  { code: 'E', name: 'Spain', inEU: true },
  { code: 'S', name: 'Sweden', inEU: true },
  // Non-EU countries (no EU flag with stars)
  { code: 'AL', name: 'Albania', inEU: false },
  { code: 'CH', name: 'Switzerland', inEU: false },
  { code: 'GB', name: 'United Kingdom', inEU: false },
  { code: 'UA', name: 'Ukraine', inEU: false },
  { code: 'RKS', name: 'Kosovo', inEU: false },
  { code: 'MK', name: 'North Macedonia', inEU: false },
  { code: 'SRB', name: 'Serbia', inEU: false },
  { code: 'MNE', name: 'Montenegro', inEU: false },
  { code: 'BIH', name: 'Bosnia', inEU: false },
  { code: 'N', name: 'Norway', inEU: false },
  { code: 'TR', name: 'Turkey', inEU: false },
  { code: 'MD', name: 'Moldova', inEU: false },
] as const;

export type EUCountryCode = typeof EU_COUNTRIES[number]['code'];

// Preset icon types
export type PresetIconType = 'heart' | 'star' | 'paw' | 'music' | 'crown' | 'smiley' | 'diamond' | 'bolt' | 'moon' | 'sun';

// Text element
export interface TextElement {
  id: string;
  text: string;
  font: string;
  fontSize: number;
  depth: number;
  color: string;
  offsetX: number;
  offsetY: number;
  rotateZ: number; // Z-axis rotation (flat rotation)
  tiltX: number; // X-axis tilt
  tiltY: number; // Y-axis tilt
}

// Icon element
export interface IconElement {
  id: string;
  type: PresetIconType | 'custom';
  name?: string; // Custom name for uploaded icons
  svgPath?: string; // For custom SVG icons (full SVG content)
  size: number;
  depth: number;
  color: string;
  offsetX: number;
  offsetY: number;
  rotateZ: number; // Z-axis rotation (flat rotation)
  tiltX: number; // X-axis tilt
  tiltY: number; // Y-axis tilt
}

interface KeychainState {
  // Mode
  mode: GeneratorMode;
  setMode: (mode: GeneratorMode) => void;

  // License plate specific
  country: EUCountryCode;
  plateNumber: string;
  showEUFlag: boolean;
  countryOffsetX: number;
  countryOffsetY: number;
  countryDepth: number;
  euStarsDepth: number;
  setCountry: (country: EUCountryCode) => void;
  setPlateNumber: (plateNumber: string) => void;
  setShowEUFlag: (show: boolean) => void;
  setCountryOffsetX: (offset: number) => void;
  setCountryOffsetY: (offset: number) => void;
  setCountryDepth: (depth: number) => void;
  setEUStarsDepth: (depth: number) => void;

  // Base plate
  style: KeychainStyle;
  width: number;
  height: number;
  thickness: number;
  baseColor: string;
  setStyle: (style: KeychainStyle) => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setThickness: (thickness: number) => void;
  setBaseColor: (color: string) => void;

  // Hole
  holePosition: HolePosition;
  holeRadius: number;
  setHolePosition: (position: HolePosition) => void;
  setHoleRadius: (radius: number) => void;

  // Multiple texts
  texts: TextElement[];
  addText: () => void;
  removeText: (id: string) => void;
  updateText: (id: string, updates: Partial<TextElement>) => void;

  // Multiple icons
  icons: IconElement[];
  addIcon: (type: PresetIconType) => void;
  addCustomIcon: (svgContent: string, name?: string) => void;
  removeIcon: (id: string) => void;
  updateIcon: (id: string, updates: Partial<IconElement>) => void;
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Generate random color for custom icons
const generateRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9',
    '#92A8D1', '#955251', '#B565A7', '#009B77', '#DD4124',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Default text element
const createDefaultText = (): TextElement => ({
  id: generateId(),
  text: 'HELLO',
  font: 'helvetiker',
  fontSize: 8,
  depth: 1.5,
  color: '#ffffff',
  offsetX: 0,
  offsetY: 0,
  rotateZ: 0,
  tiltX: 0,
  tiltY: 0,
});

// Default icon element
const createDefaultIcon = (type: PresetIconType): IconElement => ({
  id: generateId(),
  type,
  size: 8,
  depth: 1.5,
  color: '#ffcc00',
  offsetX: 15,
  offsetY: 0,
  rotateZ: 0,
  tiltX: 0,
  tiltY: 0,
});

// Default license plate text - uses DIN 1451 for authentic EU plate look
const createDefaultPlateText = (): TextElement => ({
  id: generateId(),
  text: '01 600-WE',
  font: 'din1451',
  fontSize: 10,
  depth: 1.75,
  color: '#000000',
  offsetX: 4.5,
  offsetY: 0,
  rotateZ: 0,
  tiltX: 0,
  tiltY: 0,
});

export const useKeychainStore = create<KeychainState>((set) => ({
  // Mode default
  mode: 'keychain',
  setMode: (mode) =>
    set(() => {
      // Reset to mode-appropriate defaults when switching
      if (mode === 'license_plate') {
        return {
          mode,
          style: 'rectangle' as KeychainStyle,
          width: 75,
          height: 15,
          thickness: 3.5,
          baseColor: '#ffffff',
          holePosition: 'left' as HolePosition,
          holeRadius: 2,
          country: 'RKS' as EUCountryCode,
          showEUFlag: false,
          countryOffsetX: -0.5,
          countryOffsetY: -4,
          countryDepth: 0.8,
          texts: [createDefaultPlateText()],
          icons: [],
        };
      }
      return {
        mode,
        style: 'rounded' as KeychainStyle,
        width: 60,
        height: 25,
        baseColor: '#4a90d9',
        texts: [createDefaultText()],
      };
    }),

  // License plate specific
  country: 'RKS',
  plateNumber: '01 600-WE',
  showEUFlag: false,
  countryOffsetX: -0.5,
  countryOffsetY: -4,
  countryDepth: 0.8,
  euStarsDepth: 0.3,
  setCountry: (country) => {
    // Auto-update showEUFlag based on whether country is in EU
    const countryData = EU_COUNTRIES.find(c => c.code === country);
    set({ country, showEUFlag: countryData?.inEU ?? false });
  },
  setPlateNumber: (plateNumber) => set({ plateNumber }),
  setShowEUFlag: (showEUFlag) => set({ showEUFlag }),
  setCountryOffsetX: (countryOffsetX) => set({ countryOffsetX }),
  setCountryOffsetY: (countryOffsetY) => set({ countryOffsetY }),
  setCountryDepth: (countryDepth) => set({ countryDepth }),
  setEUStarsDepth: (euStarsDepth) => set({ euStarsDepth }),

  // Base plate defaults
  style: 'rounded',
  width: 60,
  height: 25,
  thickness: 3,
  baseColor: '#4a90d9',
  setStyle: (style) => set((state) => {
    // When switching to circle, make width and height equal
    if (style === 'circle') {
      const size = Math.min(state.width, state.height);
      return { style, width: size, height: size };
    }
    return { style };
  }),
  setWidth: (width) => set((state) => {
    // For circle, keep width and height equal
    if (state.style === 'circle') {
      return { width, height: width };
    }
    return { width };
  }),
  setHeight: (height) => set((state) => {
    // For circle, keep width and height equal
    if (state.style === 'circle') {
      return { width: height, height };
    }
    return { height };
  }),
  setThickness: (thickness) => set({ thickness }),
  setBaseColor: (baseColor) => set({ baseColor }),

  // Hole defaults
  holePosition: 'left',
  holeRadius: 2.5,
  setHolePosition: (holePosition) => set({ holePosition }),
  setHoleRadius: (holeRadius) => set({ holeRadius }),

  // Texts - start with one default text
  texts: [createDefaultText()],
  addText: () =>
    set((state) => ({
      texts: [...state.texts, { ...createDefaultText(), text: 'NEW', offsetY: state.texts.length * 5 }],
    })),
  removeText: (id) =>
    set((state) => ({
      texts: state.texts.filter((t) => t.id !== id),
    })),
  updateText: (id, updates) =>
    set((state) => ({
      texts: state.texts.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  // Icons - start empty
  icons: [],
  addIcon: (type) =>
    set((state) => ({
      icons: [...state.icons, createDefaultIcon(type)],
    })),
  addCustomIcon: (svgPath, name) =>
    set((state) => ({
      icons: [
        ...state.icons,
        {
          id: generateId(),
          type: 'custom' as const,
          name: name || 'Custom Icon',
          svgPath,
          size: 8,
          depth: 1.5,
          color: generateRandomColor(),
          offsetX: 15,
          offsetY: 0,
          rotateZ: 0,
          tiltX: 0,
          tiltY: 0,
        },
      ],
    })),
  removeIcon: (id) =>
    set((state) => ({
      icons: state.icons.filter((i) => i.id !== id),
    })),
  updateIcon: (id, updates) =>
    set((state) => ({
      icons: state.icons.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    })),
}));

// Preset icons list for UI
export const PRESET_ICONS: { type: PresetIconType; label: string; emoji: string }[] = [
  { type: 'heart', label: 'Heart', emoji: '♥' },
  { type: 'star', label: 'Star', emoji: '★' },
  { type: 'paw', label: 'Paw', emoji: '🐾' },
  { type: 'music', label: 'Music', emoji: '♪' },
  { type: 'crown', label: 'Crown', emoji: '♛' },
  { type: 'smiley', label: 'Smiley', emoji: '☺' },
  { type: 'diamond', label: 'Diamond', emoji: '◆' },
  { type: 'bolt', label: 'Bolt', emoji: '⚡' },
  { type: 'moon', label: 'Moon', emoji: '☽' },
  { type: 'sun', label: 'Sun', emoji: '☀' },
];
