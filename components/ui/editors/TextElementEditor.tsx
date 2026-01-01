'use client';

import { useState, useMemo } from 'react';
import { TextElement, useKeychainStore } from '@/lib/store';
import { FONTS } from '@/lib/fonts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TextElementEditorProps {
  textElement: TextElement;
  index: number;
  onUpdate: (updates: Partial<TextElement>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  canRemove: boolean;
  otherTexts: TextElement[];
  onCloneStyle: (sourceId: string) => void;
}

export function TextElementEditor({
  textElement,
  index,
  onUpdate,
  onRemove,
  onDuplicate,
  canRemove,
  otherTexts,
  onCloneStyle,
}: TextElementEditorProps) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const [fontSearch, setFontSearch] = useState('');
  const previewText = textElement.text || 'Empty';

  // Filter fonts based on search
  const filteredFonts = useMemo(() => {
    if (!fontSearch.trim()) return FONTS;
    const search = fontSearch.toLowerCase();
    return FONTS.filter(f =>
      f.displayName.toLowerCase().includes(search) ||
      f.name.toLowerCase().includes(search)
    );
  }, [fontSearch]);

  // Get current font index in filtered list
  const currentFontIndex = useMemo(() => {
    return filteredFonts.findIndex(f => f.name === textElement.font);
  }, [filteredFonts, textElement.font]);

  // Get current font display name
  const currentFont = FONTS.find(f => f.name === textElement.font);

  // Navigate to previous/next font
  const goToPrevFont = () => {
    if (filteredFonts.length === 0) return;
    const newIndex = currentFontIndex <= 0 ? filteredFonts.length - 1 : currentFontIndex - 1;
    onUpdate({ font: filteredFonts[newIndex].name });
  };

  const goToNextFont = () => {
    if (filteredFonts.length === 0) return;
    const newIndex = currentFontIndex >= filteredFonts.length - 1 ? 0 : currentFontIndex + 1;
    onUpdate({ font: filteredFonts[newIndex].name });
  };

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
                    style={{ backgroundColor: textElement.color }}
                  />
                  <span className="font-medium">
                    {previewText.length > 12 ? `${previewText.slice(0, 12)}...` : previewText}
                  </span>
                  <span className="text-xs text-muted-foreground">Text {index + 1}</span>
                </div>
                <ChevronIcon isOpen={isOpen} />
              </button>
            </CollapsibleTrigger>
            <div className="flex items-center mr-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onDuplicate}
                title="Duplicate"
              >
                <CopyIcon />
              </Button>
              {canRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={onRemove}
                  title="Delete"
                >
                  <TrashIcon />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Clone style from another text */}
            {otherTexts.length > 0 && (
              <div className="space-y-2">
                <Label>Clone Style From</Label>
                <Select onValueChange={(id) => onCloneStyle(id)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select text to clone style..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherTexts.map((t, i) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.text || `Text ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Text</Label>
                <span className="text-sm text-muted-foreground">{textElement.text.length}/15</span>
              </div>
              <Input
                value={textElement.text}
                onChange={(e) => onUpdate({ text: e.target.value })}
                placeholder="Enter text"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label>Font</Label>
              {/* Font search */}
              <div className="relative">
                <Input
                  placeholder="Search 814 fonts..."
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  className="h-8 text-sm"
                />
                {/* Search results dropdown */}
                {fontSearch.trim() && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredFonts.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No fonts found
                      </div>
                    ) : (
                      filteredFonts.slice(0, 50).map((font) => (
                        <button
                          key={font.name}
                          className={`w-full px-3 py-1.5 text-sm text-left hover:bg-accent transition-colors ${
                            font.name === textElement.font ? 'bg-accent font-medium' : ''
                          }`}
                          onClick={() => {
                            onUpdate({ font: font.name });
                            setFontSearch('');
                          }}
                        >
                          {font.displayName}
                          <span className="text-xs text-muted-foreground ml-2">({font.category})</span>
                        </button>
                      ))
                    )}
                    {filteredFonts.length > 50 && (
                      <div className="p-2 text-xs text-muted-foreground text-center border-t">
                        +{filteredFonts.length - 50} more results...
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Font navigator */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={goToPrevFont}
                  disabled={filteredFonts.length === 0}
                >
                  <ChevronLeftIcon />
                </Button>
                <div className="flex-1 text-center min-w-0">
                  <div className="text-xs text-muted-foreground">
                    {currentFontIndex >= 0 ? currentFontIndex + 1 : '-'}/{filteredFonts.length}
                  </div>
                  <div className="font-medium text-sm truncate" title={currentFont?.displayName}>
                    {currentFont?.displayName || 'Unknown'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={goToNextFont}
                  disabled={filteredFonts.length === 0}
                >
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={textElement.color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={textElement.color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{textElement.fontSize}mm</span>
              </div>
              <Slider
                value={[textElement.fontSize]}
                onValueChange={([v]) => onUpdate({ fontSize: v })}
                min={4}
                max={15}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Depth</Label>
                <span className="text-sm text-muted-foreground">{textElement.depth}mm</span>
              </div>
              <Slider
                value={[textElement.depth]}
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
                  <span className="text-sm text-muted-foreground">{textElement.offsetX}mm</span>
                </div>
                <Slider
                  value={[textElement.offsetX]}
                  onValueChange={([v]) => onUpdate({ offsetX: v })}
                  min={-30}
                  max={30}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Y Offset</Label>
                  <span className="text-sm text-muted-foreground">{textElement.offsetY}mm</span>
                </div>
                <Slider
                  value={[textElement.offsetY]}
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
                  <span className="text-sm text-muted-foreground">{textElement.rotateZ}°</span>
                </div>
                <Slider
                  value={[textElement.rotateZ]}
                  onValueChange={([v]) => onUpdate({ rotateZ: v })}
                  min={-180}
                  max={180}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tilt X</Label>
                  <span className="text-sm text-muted-foreground">{textElement.tiltX}°</span>
                </div>
                <Slider
                  value={[textElement.tiltX]}
                  onValueChange={([v]) => onUpdate({ tiltX: v })}
                  min={-45}
                  max={45}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Tilt Y</Label>
                  <span className="text-sm text-muted-foreground">{textElement.tiltY}°</span>
                </div>
                <Slider
                  value={[textElement.tiltY]}
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

function CopyIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="9" height="9" rx="1" />
      <path d="M2 11V3a1 1 0 011-1h8" />
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

function ChevronLeftIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 4l-4 4 4 4" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

export default TextElementEditor;
