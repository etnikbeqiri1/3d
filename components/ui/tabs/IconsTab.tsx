'use client';

import { useRef } from 'react';
import { useKeychainStore, PRESET_ICONS } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconElementEditor } from '../editors/IconElementEditor';

export function IconsTab() {
  const { icons, addIcon, addCustomIcon, removeIcon, updateIcon } = useKeychainStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSVGUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    // Extract name from filename (remove extension)
    const iconName = file.name.replace(/\.svg$/i, '').replace(/[-_]/g, ' ');

    reader.onload = (e) => {
      const svgContent = e.target?.result as string;

      // Validate it's an SVG
      if (svgContent.includes('<svg') && svgContent.includes('</svg>')) {
        addCustomIcon(svgContent, iconName);
      } else {
        alert('Invalid SVG file');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Add Icon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {PRESET_ICONS.map(({ type, label, emoji }) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() => addIcon(type)}
                className="h-10 text-lg"
                title={label}
              >
                {emoji}
              </Button>
            ))}
          </div>
          <div className="pt-2 border-t">
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              onChange={handleSVGUpload}
              className="hidden"
              id="svg-upload"
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Custom SVG
            </Button>
          </div>
        </CardContent>
      </Card>

      {icons.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm text-muted-foreground">
            {icons.length} icon{icons.length !== 1 ? 's' : ''}
          </span>
          {icons.map((iconEl, index) => (
            <IconElementEditor
              key={iconEl.id}
              iconElement={iconEl}
              index={index}
              onUpdate={(updates) => updateIcon(iconEl.id, updates)}
              onRemove={() => removeIcon(iconEl.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default IconsTab;
