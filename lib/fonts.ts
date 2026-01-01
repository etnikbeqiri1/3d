export interface FontConfig {
  name: string;
  displayName: string;
  path: string;
  category: 'sans-serif' | 'serif' | 'script' | 'display';
}

export const FONTS: FontConfig[] = [
  {
    name: 'din1451',
    displayName: 'DIN 1451 (License Plate)',
    path: '/fonts/din1451.typeface.json',
    category: 'sans-serif',
  },
  {
    name: 'helvetiker',
    displayName: 'Helvetiker',
    path: '/fonts/helvetiker_regular.typeface.json',
    category: 'sans-serif',
  },
  {
    name: 'helvetiker_bold',
    displayName: 'Helvetiker Bold',
    path: '/fonts/helvetiker_bold.typeface.json',
    category: 'sans-serif',
  },
  {
    name: 'optimer',
    displayName: 'Optimer',
    path: '/fonts/optimer_regular.typeface.json',
    category: 'serif',
  },
  {
    name: 'optimer_bold',
    displayName: 'Optimer Bold',
    path: '/fonts/optimer_bold.typeface.json',
    category: 'serif',
  },
  {
    name: 'gentilis',
    displayName: 'Gentilis',
    path: '/fonts/gentilis_regular.typeface.json',
    category: 'serif',
  },
  {
    name: 'gentilis_bold',
    displayName: 'Gentilis Bold',
    path: '/fonts/gentilis_bold.typeface.json',
    category: 'serif',
  },
  {
    name: 'droid_sans',
    displayName: 'Droid Sans',
    path: '/fonts/droid_sans_regular.typeface.json',
    category: 'sans-serif',
  },
  {
    name: 'droid_serif',
    displayName: 'Droid Serif',
    path: '/fonts/droid_serif_regular.typeface.json',
    category: 'serif',
  },
];

export const getFontByName = (name: string): FontConfig | undefined => {
  return FONTS.find((f) => f.name === name);
};
