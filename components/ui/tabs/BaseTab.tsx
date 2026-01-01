'use client';

import { useKeychainStore, KeychainStyle, HolePosition, FrameStyle, EU_COUNTRIES, EUCountryCode } from '@/lib/store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const SHAPES: { value: KeychainStyle; label: string; icon: string }[] = [
  { value: 'rounded', label: 'Rounded', icon: '▢' },
  { value: 'rectangle', label: 'Rectangle', icon: '▭' },
  { value: 'circle', label: 'Circle', icon: '○' },
  { value: 'pill', label: 'Pill', icon: '⬭' },
  { value: 'badge', label: 'Badge', icon: '⬡' },
];

const HOLE_POSITIONS: { value: HolePosition; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'top', label: 'Top' },
  { value: 'right', label: 'Right' },
  { value: 'none', label: 'None' },
];

const FRAME_STYLES: { value: FrameStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'simple', label: 'Simple' },
  { value: 'double', label: 'Double' },
  { value: 'ridge', label: 'Ridge' },
];

export function BaseTab() {
  const {
    mode,
    country, setCountry,
    showEUFlag, setShowEUFlag,
    countryOffsetX, setCountryOffsetX,
    countryOffsetY, setCountryOffsetY,
    countryDepth, setCountryDepth,
    euStarsDepth, setEUStarsDepth,
    style, setStyle,
    width, setWidth,
    height, setHeight,
    thickness, setThickness,
    baseColor, setBaseColor,
    frameStyle, setFrameStyle,
    frameColor, setFrameColor,
    frameWidth, setFrameWidth,
    holePosition, setHolePosition,
    holeRadius, setHoleRadius,
  } = useKeychainStore();

  return (
    <div className="space-y-4">
      {mode === 'keychain' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Shape & Frame</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Shape</Label>
              <Select value={style} onValueChange={(value) => setStyle(value as KeychainStyle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHAPES.map(({ value, label, icon }) => (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span>{label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frame</Label>
              <Select value={frameStyle} onValueChange={(value) => setFrameStyle(value as FrameStyle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FRAME_STYLES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {frameStyle !== 'none' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Frame Thickness</Label>
                    <span className="text-sm text-muted-foreground">{frameWidth}mm</span>
                  </div>
                  <Slider
                    value={[frameWidth]}
                    onValueChange={([v]) => setFrameWidth(v)}
                    min={0.5}
                    max={4}
                    step={0.25}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frame Color</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      type="color"
                      value={frameColor}
                      onChange={(e) => setFrameColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={frameColor}
                      onChange={(e) => setFrameColor(e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {mode === 'license_plate' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Country & EU Flag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={country} onValueChange={(value) => setCountry(value as EUCountryCode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {EU_COUNTRIES.map(({ code, name, inEU }) => (
                  <SelectItem key={code} value={code}>
                    {code} - {name} {!inEU && '(non-EU)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label>EU Stars</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={showEUFlag ? 'show' : 'hide'}
                onValueChange={(value) => value && setShowEUFlag(value === 'show')}
                className="flex w-full"
              >
                <ToggleGroupItem value="show" variant="outline" className="flex-1">
                  Show
                </ToggleGroupItem>
                <ToggleGroupItem value="hide" variant="outline" className="flex-1">
                  Hide
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Country X Offset</Label>
                <span className="text-sm text-muted-foreground">{countryOffsetX}mm</span>
              </div>
              <Slider
                value={[countryOffsetX]}
                onValueChange={([v]) => setCountryOffsetX(v)}
                min={-5}
                max={5}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Country Y Offset</Label>
                <span className="text-sm text-muted-foreground">{countryOffsetY}mm</span>
              </div>
              <Slider
                value={[countryOffsetY]}
                onValueChange={([v]) => setCountryOffsetY(v)}
                min={-5}
                max={5}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Country Text Depth</Label>
                <span className="text-sm text-muted-foreground">{countryDepth}mm</span>
              </div>
              <Slider
                value={[countryDepth]}
                onValueChange={([v]) => setCountryDepth(v)}
                min={0.2}
                max={2}
                step={0.1}
              />
            </div>

            {showEUFlag && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>EU Stars Depth</Label>
                  <span className="text-sm text-muted-foreground">{euStarsDepth}mm</span>
                </div>
                <Slider
                  value={[euStarsDepth]}
                  onValueChange={([v]) => setEUStarsDepth(v)}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {style === 'circle' ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Diameter</Label>
                <span className="text-sm text-muted-foreground">{width}mm</span>
              </div>
              <Slider
                value={[width]}
                onValueChange={([v]) => setWidth(v)}
                min={15}
                max={60}
                step={1}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Width</Label>
                  <span className="text-sm text-muted-foreground">{width}mm</span>
                </div>
                <Slider
                  value={[width]}
                  onValueChange={([v]) => setWidth(v)}
                  min={30}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Height</Label>
                  <span className="text-sm text-muted-foreground">{height}mm</span>
                </div>
                <Slider
                  value={[height]}
                  onValueChange={([v]) => setHeight(v)}
                  min={15}
                  max={60}
                  step={1}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Thickness</Label>
              <span className="text-sm text-muted-foreground">{thickness}mm</span>
            </div>
            <Slider
              value={[thickness]}
              onValueChange={([v]) => setThickness(v)}
              min={1}
              max={6}
              step={0.5}
            />
          </div>
        </CardContent>
      </Card>

      {mode === 'keychain' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Base Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-center">
              <Input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="flex-1 font-mono"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Keyring Hole</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              value={holePosition}
              onValueChange={(value) => value && setHolePosition(value as HolePosition)}
              className="flex w-full"
            >
              {HOLE_POSITIONS.map(({ value, label }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant="outline"
                  className="flex-1"
                >
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {holePosition !== 'none' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Hole Radius</Label>
                <span className="text-sm text-muted-foreground">{holeRadius}mm</span>
              </div>
              <Slider
                value={[holeRadius]}
                onValueChange={([v]) => setHoleRadius(v)}
                min={1.5}
                max={5}
                step={0.5}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BaseTab;
