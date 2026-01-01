'use client';

import { useKeychainStore, KeychainStyle, HolePosition, EU_COUNTRIES, EUCountryCode } from '@/lib/store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const SHAPES: { value: KeychainStyle; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
  { value: 'badge', label: 'Badge' },
];

const HOLE_POSITIONS: { value: HolePosition; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'top', label: 'Top' },
  { value: 'right', label: 'Right' },
  { value: 'none', label: 'None' },
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
    holePosition, setHolePosition,
    holeRadius, setHoleRadius,
  } = useKeychainStore();

  return (
    <div className="space-y-4">
      {mode === 'keychain' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Shape</CardTitle>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              variant="outline"
              value={style}
              onValueChange={(value) => value && setStyle(value as KeychainStyle)}
              className="grid grid-cols-3 gap-1 w-full"
            >
              {SHAPES.map(({ value, label }) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  variant="outline"
                  className="text-xs"
                >
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
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
