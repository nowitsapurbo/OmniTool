"use client";

import { useState, useCallback, useEffect } from "react";
import { ToolHeader } from "@/components/tool-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Palette, Pipette, RefreshCw, Contrast, Blend } from "lucide-react";

interface ColorValues {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export default function ColorToolPage() {
  const [color, setColor] = useState<ColorValues>({
    hex: "#6366f1",
    rgb: { r: 99, g: 102, b: 241 },
    hsl: { h: 239, s: 84, l: 67 },
    hsv: { h: 239, s: 59, v: 95 },
    cmyk: { c: 59, m: 58, y: 0, k: 5 }
  });
  const [contrastColor, setContrastColor] = useState("#ffffff");
  const [contrastRatio, setContrastRatio] = useState(0);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    const rr = r / 255, gg = g / 255, bb = b / 255;
    const k = 1 - Math.max(rr, gg, bb);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = (1 - rr - k) / (1 - k);
    const m = (1 - gg - k) / (1 - k);
    const y = (1 - bb - k) / (1 - k);
    return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
  };

  const updateFromHex = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl, hsv, cmyk });
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    setColor({ hex, rgb: { r, g, b }, hsl, hsv, cmyk });
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setColor({ hex, rgb, hsl: { h, s, l }, hsv, cmyk });
  }, []);

  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const getContrastRatio = useCallback((hex1: string, hex2: string): number => {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return 0;
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }, []);

  useEffect(() => {
    setContrastRatio(getContrastRatio(color.hex, contrastColor));
  }, [color.hex, contrastColor, getContrastRatio]);

  const generateRandomColor = () => {
    const hex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateFromHex(hex);
  };

  const generatePalette = (type: 'complementary' | 'analogous' | 'triadic' | 'shades'): string[] => {
    const { h, s, l } = color.hsl;
    switch (type) {
      case 'complementary':
        return [color.hex, rgbToHex(...Object.values(hslToRgb((h + 180) % 360, s, l)) as [number, number, number])];
      case 'analogous':
        return [
          rgbToHex(...Object.values(hslToRgb((h - 30 + 360) % 360, s, l)) as [number, number, number]),
          color.hex,
          rgbToHex(...Object.values(hslToRgb((h + 30) % 360, s, l)) as [number, number, number]),
        ];
      case 'triadic':
        return [
          color.hex,
          rgbToHex(...Object.values(hslToRgb((h + 120) % 360, s, l)) as [number, number, number]),
          rgbToHex(...Object.values(hslToRgb((h + 240) % 360, s, l)) as [number, number, number]),
        ];
      case 'shades':
        return [20, 40, 60, 80, 100].map(lightness => 
          rgbToHex(...Object.values(hslToRgb(h, s, lightness)) as [number, number, number])
        );
      default:
        return [];
    }
  };

  const getContrastRating = (ratio: number): { label: string; color: string } => {
    if (ratio >= 7) return { label: "AAA", color: "text-green-500" };
    if (ratio >= 4.5) return { label: "AA", color: "text-yellow-500" };
    if (ratio >= 3) return { label: "AA Large", color: "text-orange-500" };
    return { label: "Fail", color: "text-red-500" };
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        icon={Palette}
        name="Color Tool"
        description="Color picker, converter, and palette generator"
        suite="Frontend"
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Color Display & Picker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/50 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="w-full aspect-square rounded-lg border border-border/50 shadow-lg"
                style={{ backgroundColor: color.hex }}
              />
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={color.hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={color.hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="flex-1 font-mono uppercase"
                />
                <CopyButton value={color.hex} />
              </div>
              <Button onClick={generateRandomColor} variant="outline" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" />
                Random Color
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Pipette className="h-4 w-4" />
                Color Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="rgb" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="rgb">RGB</TabsTrigger>
                  <TabsTrigger value="hsl">HSL</TabsTrigger>
                  <TabsTrigger value="hsv">HSV</TabsTrigger>
                  <TabsTrigger value="cmyk">CMYK</TabsTrigger>
                </TabsList>

                <TabsContent value="rgb" className="space-y-4">
                  {['r', 'g', 'b'].map((channel) => (
                    <div key={channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="uppercase font-semibold">{channel}</Label>
                        <span className="font-mono text-sm">{color.rgb[channel as keyof typeof color.rgb]}</span>
                      </div>
                      <Slider
                        value={[color.rgb[channel as keyof typeof color.rgb]]}
                        onValueChange={(v) => updateFromRgb(
                          channel === 'r' ? v[0] : color.rgb.r,
                          channel === 'g' ? v[0] : color.rgb.g,
                          channel === 'b' ? v[0] : color.rgb.b
                        )}
                        min={0}
                        max={255}
                        className="py-2"
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-2">
                    <code className="flex-1 p-2 rounded bg-muted font-mono text-sm">
                      rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                    </code>
                    <CopyButton value={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`} />
                  </div>
                </TabsContent>

                <TabsContent value="hsl" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Hue</Label>
                      <span className="font-mono text-sm">{color.hsl.h}°</span>
                    </div>
                    <Slider
                      value={[color.hsl.h]}
                      onValueChange={(v) => updateFromHsl(v[0], color.hsl.s, color.hsl.l)}
                      min={0}
                      max={360}
                      className="py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Saturation</Label>
                      <span className="font-mono text-sm">{color.hsl.s}%</span>
                    </div>
                    <Slider
                      value={[color.hsl.s]}
                      onValueChange={(v) => updateFromHsl(color.hsl.h, v[0], color.hsl.l)}
                      min={0}
                      max={100}
                      className="py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Lightness</Label>
                      <span className="font-mono text-sm">{color.hsl.l}%</span>
                    </div>
                    <Slider
                      value={[color.hsl.l]}
                      onValueChange={(v) => updateFromHsl(color.hsl.h, color.hsl.s, v[0])}
                      min={0}
                      max={100}
                      className="py-2"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <code className="flex-1 p-2 rounded bg-muted font-mono text-sm">
                      hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)
                    </code>
                    <CopyButton value={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`} />
                  </div>
                </TabsContent>

                <TabsContent value="hsv" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Hue</Label>
                      <div className="font-mono text-lg">{color.hsv.h}°</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Saturation</Label>
                      <div className="font-mono text-lg">{color.hsv.s}%</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <div className="font-mono text-lg">{color.hsv.v}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <code className="flex-1 p-2 rounded bg-muted font-mono text-sm">
                      hsv({color.hsv.h}, {color.hsv.s}%, {color.hsv.v}%)
                    </code>
                    <CopyButton value={`hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`} />
                  </div>
                </TabsContent>

                <TabsContent value="cmyk" className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {['c', 'm', 'y', 'k'].map((channel) => (
                      <div key={channel} className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase">{channel}</Label>
                        <div className="font-mono text-lg">{color.cmyk[channel as keyof typeof color.cmyk]}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <code className="flex-1 p-2 rounded bg-muted font-mono text-sm">
                      cmyk({color.cmyk.c}%, {color.cmyk.m}%, {color.cmyk.y}%, {color.cmyk.k}%)
                    </code>
                    <CopyButton value={`cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Contrast Checker */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              Contrast Checker (WCAG)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Foreground</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateFromHex(e.target.value)}
                        className="w-10 h-10 p-1 cursor-pointer"
                      />
                      <span className="font-mono text-sm">{color.hex}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Background</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={contrastColor}
                        onChange={(e) => setContrastColor(e.target.value)}
                        className="w-10 h-10 p-1 cursor-pointer"
                      />
                      <span className="font-mono text-sm">{contrastColor}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Contrast Ratio</Label>
                    <div className="font-mono text-2xl font-bold">{contrastRatio.toFixed(2)}:1</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">WCAG Rating</Label>
                    <div className={`text-2xl font-bold ${getContrastRating(contrastRatio).color}`}>
                      {getContrastRating(contrastRatio).label}
                    </div>
                  </div>
                </div>
              </div>
              <div 
                className="rounded-lg p-6 flex items-center justify-center text-center"
                style={{ backgroundColor: contrastColor }}
              >
                <div style={{ color: color.hex }}>
                  <p className="text-2xl font-bold mb-2">Sample Text</p>
                  <p className="text-sm">This is how your text will look</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palettes */}
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Blend className="h-4 w-4" />
              Color Palettes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(['complementary', 'analogous', 'triadic', 'shades'] as const).map((type) => (
                <div key={type}>
                  <Label className="text-xs text-muted-foreground capitalize mb-2 block">{type}</Label>
                  <div className="flex rounded-lg overflow-hidden border border-border/50">
                    {generatePalette(type).map((hex, i) => (
                      <button
                        key={i}
                        className="flex-1 h-12 transition-transform hover:scale-110 hover:z-10 relative group"
                        style={{ backgroundColor: hex }}
                        onClick={() => updateFromHex(hex)}
                        title={hex}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 text-white text-xs font-mono">
                          {hex}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
