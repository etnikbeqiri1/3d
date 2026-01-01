import { Metadata } from 'next';
import { KeychainGenerator } from '@/components/KeychainGenerator';

export const metadata: Metadata = {
  title: "Mini License Plate Keychain Generator",
  description: "Create miniature EU-style license plate keychains with country codes and custom text. Download free STL & 3MF files for 3D printing.",
  keywords: [
    "license plate keychain",
    "EU license plate",
    "mini license plate",
    "car plate keychain",
    "European license plate",
    "country code keychain",
  ],
  openGraph: {
    title: "Mini License Plate Keychain Generator - EU Style",
    description: "Create miniature EU-style license plate keychains with country codes.",
  },
};

export default function LicensePlatePage() {
  return <KeychainGenerator initialMode="license_plate" />;
}
