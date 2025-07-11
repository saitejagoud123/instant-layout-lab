import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PolaroidEditorProps {
  imageSrc: string;
  onCropChange: (cropData: any) => void;
}

const PRESET_SIZES = {
  '2x3': { width: 2, height: 3, label: '2×3 inches' },
  '4x6': { width: 4, height: 6, label: '4×6 inches' },
  '5x7': { width: 5, height: 7, label: '5×7 inches' },
};

export const PolaroidEditor = ({ imageSrc, onCropChange }: PolaroidEditorProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedSize, setSelectedSize] = useState('4x6');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
    onCropChange({ 
      crop, 
      zoom, 
      rotation, 
      croppedAreaPixels,
        dimensions: selectedSize === 'custom' 
        ? { width: parseFloat(customWidth) || 4, height: parseFloat(customHeight) || 6 }
        : PRESET_SIZES[selectedSize as keyof typeof PRESET_SIZES]
    });
  }, [crop, zoom, rotation, onCropChange, selectedSize, customWidth, customHeight]);

  const currentDimensions = selectedSize === 'custom' 
    ? { width: parseFloat(customWidth) || 4, height: parseFloat(customHeight) || 6 }
    : PRESET_SIZES[selectedSize as keyof typeof PRESET_SIZES];

  // Calculate aspect ratio for the image area
  // Image area = total width - (5% + 5%) for left/right borders
  // Image area height = total height - (10% + 16.6%) for top/bottom borders
  const imageAreaWidth = currentDimensions.width * 0.9; // 90% of width
  const imageAreaHeight = currentDimensions.height * 0.734; // 73.4% of height
  const imageAreaRatio = imageAreaWidth / imageAreaHeight;

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      <Card className="p-4 bg-gradient-warm">
        <Label className="text-sm font-medium mb-3 block">Output Size</Label>
        <div className="space-y-4">
          <Select value={selectedSize} onValueChange={setSelectedSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESET_SIZES).map(([key, size]) => (
                <SelectItem key={key} value={key}>
                  {size.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Size</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedSize === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width (inches)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="20"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  placeholder="4"
                />
              </div>
              <div>
                <Label className="text-xs">Height (inches)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="20"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  placeholder="6"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Polaroid Preview */}
      <Card className="overflow-hidden bg-polaroid-frame shadow-lg">
        <div 
          className="relative mx-auto bg-polaroid-frame"
          style={{ 
            width: '300px',
            height: `${300 / currentDimensions.width * currentDimensions.height}px`,
            padding: `${10}% ${5}% ${16.6}% ${5}%`,
          }}
        >
          {/* Image Area */}
          <div 
            className="relative bg-editor-bg overflow-hidden w-full h-full"
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={imageAreaRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="rect"
              showGrid={false}
              style={{
                containerStyle: {
                  backgroundColor: 'hsl(var(--editor-bg))',
                },
                cropAreaStyle: {
                  border: '2px solid hsl(var(--primary))',
                },
              }}
            />
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4 space-y-4 bg-gradient-warm">
        <div>
          <Label className="text-sm font-medium mb-2 block">Zoom</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.max(1, zoom - 0.1))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">Rotation</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation(0)}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Slider
              value={[rotation]}
              onValueChange={(value) => setRotation(value[0])}
              min={-180}
              max={180}
              step={1}
              className="flex-1"
            />
            <span className="text-sm w-12 text-right">{rotation}°</span>
          </div>
        </div>
      </Card>

    </div>
  );
};