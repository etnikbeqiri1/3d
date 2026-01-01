'use client';

import { useState } from 'react';
import { IconElement, PRESET_ICONS } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface IconElementEditorProps {
  iconElement: IconElement;
  index: number;
  onUpdate: (updates: Partial<IconElement>) => void;
  onRemove: () => void;
}

export function IconElementEditor({
  iconElement,
  index,
  onUpdate,
  onRemove,
}: IconElementEditorProps) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const iconInfo = PRESET_ICONS.find((i) => i.type === iconElement.type);
  const isCustom = iconElement.type === 'custom';
  const displayName = isCustom ? (iconElement.name || 'Custom Icon') : (iconInfo?.label || 'Icon');
  const emoji = isCustom ? '📁' : (iconInfo?.emoji || '?');

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="p-0">
          <div className="flex items-center">
            <CollapsibleTrigger asChild>
              <button className="flex-1 flex items-center justify-between h-auto p-3 hover:bg-accent/50 transition-colors text-left">
                <div className="flex items-center gap-2">
                  <div
                    className="size-3 rounded-full border border-border"
                    style={{ backgroundColor: iconElement.color }}
                  />
                  <span className="text-lg">{emoji}</span>
                  <span className="font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">Icon {index + 1}</span>
                </div>
                <ChevronIcon isOpen={isOpen} />
              </button>
            </CollapsibleTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 mr-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onRemove}
            >
              <TrashIcon />
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={iconElement.color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={iconElement.color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Size</Label>
                <span className="text-sm text-muted-foreground">{iconElement.size}mm</span>
              </div>
              <Slider
                value={[iconElement.size]}
                onValueChange={([v]) => onUpdate({ size: v })}
                min={4}
                max={20}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Depth</Label>
                <span className="text-sm text-muted-foreground">{iconElement.depth}mm</span>
              </div>
              <Slider
                value={[iconElement.depth]}
                onValueChange={([v]) => onUpdate({ depth: v })}
                min={0.5}
                max={3}
                step={0.1}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground">Position</Label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>X Offset</Label>
                  <span className="text-sm text-muted-foreground">{iconElement.offsetX}mm</span>
                </div>
                <Slider
                  value={[iconElement.offsetX]}
                  onValueChange={([v]) => onUpdate({ offsetX: v })}
                  min={-30}
                  max={30}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Y Offset</Label>
                  <span className="text-sm text-muted-foreground">{iconElement.offsetY}mm</span>
                </div>
                <Slider
                  value={[iconElement.offsetY]}
                  onValueChange={([v]) => onUpdate({ offsetY: v })}
                  min={-15}
                  max={15}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground">Rotation</Label>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Rotate</Label>
                  <span className="text-sm text-muted-foreground">{iconElement.rotateZ}°</span>
                </div>
                <Slider
                  value={[iconElement.rotateZ]}
                  onValueChange={([v]) => onUpdate({ rotateZ: v })}
                  min={-180}
                  max={180}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tilt X</Label>
                  <span className="text-sm text-muted-foreground">{iconElement.tiltX}°</span>
                </div>
                <Slider
                  value={[iconElement.tiltX]}
                  onValueChange={([v]) => onUpdate({ tiltX: v })}
                  min={-45}
                  max={45}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tilt Y</Label>
                  <span className="text-sm text-muted-foreground">{iconElement.tiltY}°</span>
                </div>
                <Slider
                  value={[iconElement.tiltY]}
                  onValueChange={([v]) => onUpdate({ tiltY: v })}
                  min={-45}
                  max={45}
                  step={5}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function TrashIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4M12.667 4v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export default IconElementEditor;
