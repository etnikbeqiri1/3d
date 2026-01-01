'use client';

import { useRef } from 'react';
import { useKeychainStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseTab } from './tabs/BaseTab';
import { TextsTab } from './tabs/TextsTab';
import { IconsTab } from './tabs/IconsTab';

interface ControlPanelProps {
  onExport: () => void;
  onExport3MF: () => void;
}

export function ControlPanel({ onExport, onExport3MF }: ControlPanelProps) {
  const { mode, texts, icons, exportConfig, importConfig } = useKeychainStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportConfig = () => {
    const json = exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keychain-config.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const success = importConfig(json);
      if (!success) {
        alert('Invalid config file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopyConfig = () => {
    const json = exportConfig();
    navigator.clipboard.writeText(json);
  };

  return (
    <div className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle>
          {mode === 'keychain' ? 'Keychain' : 'License Plate'} Generator
        </CardTitle>
        <CardDescription>
          Create custom 3D printable {mode === 'keychain' ? 'keychains' : 'license plates'}
        </CardDescription>
      </CardHeader>

      <Tabs defaultValue="base" className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-6 pb-4">
          <TabsList className="w-full">
            <TabsTrigger value="base" className="flex-1">Base</TabsTrigger>
            <TabsTrigger value="texts" className="flex-1">
              {mode === 'license_plate' ? 'Plate' : 'Texts'} {texts.length > 0 && `(${texts.length})`}
            </TabsTrigger>
            {mode === 'keychain' && (
              <TabsTrigger value="icons" className="flex-1">
                Icons {icons.length > 0 && `(${icons.length})`}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-6 pb-4">
              <TabsContent value="base" className="m-0">
                <BaseTab />
              </TabsContent>
              <TabsContent value="texts" className="m-0">
                <TextsTab />
              </TabsContent>
              {mode === 'keychain' && (
                <TabsContent value="icons" className="m-0">
                  <IconsTab />
                </TabsContent>
              )}
            </div>
          </ScrollArea>
        </div>
      </Tabs>

      <Separator />
      <div className="p-6 space-y-2">
        <Button onClick={onExport} className="w-full" size="lg">
          Export STL
        </Button>
        <Button onClick={onExport3MF} variant="secondary" className="w-full" size="lg">
          Export 3MF (Multi-Color)
        </Button>
        <Separator className="my-3" />
        <div className="flex gap-2">
          <Button onClick={handleExportConfig} variant="outline" size="sm" className="flex-1">
            Save Config
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" className="flex-1">
            Load Config
          </Button>
          <Button onClick={handleCopyConfig} variant="outline" size="sm" className="flex-1">
            Copy
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportConfig}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default ControlPanel;
