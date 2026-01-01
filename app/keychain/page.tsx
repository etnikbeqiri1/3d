import { Metadata } from 'next';
import { KeychainGenerator } from '@/components/KeychainGenerator';

export const metadata: Metadata = {
  title: "Custom 3D Keychain Maker",
  description: "Design personalized 3D printable keychains with custom text, icons, and shapes. Download free STL & 3MF files for your 3D printer.",
  keywords: [
    "custom keychain",
    "3D printed keychain",
    "personalized keychain",
    "name keychain",
    "STL keychain",
  ],
  openGraph: {
    title: "Custom 3D Keychain Maker - Free STL Generator",
    description: "Create personalized 3D printable keychains with custom text and icons.",
  },
};

export default function KeychainPage() {
  return <KeychainGenerator initialMode="keychain" />;
}
