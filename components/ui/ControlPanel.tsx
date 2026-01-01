'use client';

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
  const { mode, texts, icons } = useKeychainStore();

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
      </div>
    </div>
  );
}

export default ControlPanel;
