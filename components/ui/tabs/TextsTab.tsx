'use client';

import { useKeychainStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TextElementEditor } from '../editors/TextElementEditor';

export function TextsTab() {
  const { mode, texts, addText, removeText, updateText, duplicateText, cloneTextStyle } = useKeychainStore();

  // License plate mode - simplified plate number editor
  if (mode === 'license_plate') {
    const plateText = texts[0];
    if (!plateText) return null;

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Plate Number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Number</Label>
              <Input
                value={plateText.text}
                onChange={(e) => updateText(plateText.id, { text: e.target.value.toUpperCase() })}
                placeholder="AB 123 CD"
                className="font-mono text-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Font Size</Label>
                <span className="text-sm text-muted-foreground">{plateText.fontSize}mm</span>
              </div>
              <Slider
                value={[plateText.fontSize]}
                onValueChange={([v]) => updateText(plateText.id, { fontSize: v })}
                min={3}
                max={10}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Depth</Label>
                <span className="text-sm text-muted-foreground">{plateText.depth}mm</span>
              </div>
              <Slider
                value={[plateText.depth]}
                onValueChange={([v]) => updateText(plateText.id, { depth: v })}
                min={0.5}
                max={3}
                step={0.25}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Position X</Label>
                <span className="text-sm text-muted-foreground">{plateText.offsetX}mm</span>
              </div>
              <Slider
                value={[plateText.offsetX]}
                onValueChange={([v]) => updateText(plateText.id, { offsetX: v })}
                min={-20}
                max={30}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Position Y</Label>
                <span className="text-sm text-muted-foreground">{plateText.offsetY}mm</span>
              </div>
              <Slider
                value={[plateText.offsetY]}
                onValueChange={([v]) => updateText(plateText.id, { offsetY: v })}
                min={-10}
                max={10}
                step={0.5}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Keychain mode - multiple text elements
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {texts.length} text{texts.length !== 1 ? 's' : ''}
        </span>
        <Button onClick={addText} size="sm" variant="outline">
          <PlusIcon />
          Add Text
        </Button>
      </div>

      {texts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">No text elements yet</p>
            <Button onClick={addText} variant="secondary">
              Add your first text
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {texts.map((textEl, index) => (
            <TextElementEditor
              key={textEl.id}
              textElement={textEl}
              index={index}
              onUpdate={(updates) => updateText(textEl.id, updates)}
              onRemove={() => removeText(textEl.id)}
              onDuplicate={() => duplicateText(textEl.id)}
              canRemove={texts.length > 1}
              otherTexts={texts.filter((t) => t.id !== textEl.id)}
              onCloneStyle={(sourceId) => cloneTextStyle(sourceId, textEl.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="size-4 mr-1" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export default TextsTab;
