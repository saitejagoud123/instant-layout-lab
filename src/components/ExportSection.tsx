import { useState } from 'react';
import { Download, Printer, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getCroppedImg, downloadImage, type CropData } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface ExportSectionProps {
  imageSrc: string | null;
  cropData: CropData | null;
  onAddToPrintLayout: (imageData: string) => void;
  printImages: string[];
}

export const ExportSection = ({ imageSrc, cropData, onAddToPrintLayout, printImages }: ExportSectionProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('jpeg');
  const { toast } = useToast();

  const handleExport = async () => {
    if (!imageSrc || !cropData) {
      toast({
        title: "No image to export",
        description: "Please upload and crop an image first.",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, cropData, exportFormat);
      const filename = `polaroid-${Date.now()}.${exportFormat}`;
      downloadImage(croppedImage, filename);
      
      toast({
        title: "Export successful!",
        description: `Your Polaroid has been saved as ${filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddToPrintLayout = async () => {
    if (!imageSrc || !cropData) {
      toast({
        title: "No image to add",
        description: "Please upload and crop an image first.",
        variant: "destructive"
      });
      return;
    }

    if (printImages.length >= 8) {
      toast({
        title: "Print layout full",
        description: "You can add up to 8 images to the print layout.",
        variant: "destructive"
      });
      return;
    }

    try {
      const croppedImage = await getCroppedImg(imageSrc, cropData, 'jpeg');
      onAddToPrintLayout(croppedImage);
      
      toast({
        title: "Added to print layout",
        description: `Image added successfully! (${printImages.length + 1}/8)`,
      });
    } catch (error) {
      console.error('Failed to add to print layout:', error);
      toast({
        title: "Failed to add image",
        description: "There was an error adding the image to print layout.",
        variant: "destructive"
      });
    }
  };

  const canExport = imageSrc && cropData;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-warm">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Options
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <Select value={exportFormat} onValueChange={(value: 'png' | 'jpeg') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG (Smaller file)</SelectItem>
                <SelectItem value="png">PNG (Higher quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleExport} 
              disabled={!canExport || isExporting}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Download'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleAddToPrintLayout}
              disabled={!canExport || printImages.length >= 8}
            >
              <Printer className="w-4 h-4 mr-2" />
              Add to Print
            </Button>
          </div>
        </div>
      </Card>

      {printImages.length > 0 && (
        <Card className="p-4 bg-gradient-warm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Layout
            <Badge variant="secondary" className="ml-auto">
              {printImages.length}/8
            </Badge>
          </h3>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {printImages.map((image, index) => (
              <div key={index} className="aspect-[4/6] bg-polaroid-frame rounded border overflow-hidden shadow-sm">
                <img 
                  src={image} 
                  alt={`Print ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {Array.from({ length: 8 - printImages.length }).map((_, index) => (
              <div 
                key={`empty-${index}`}
                className="aspect-[4/6] bg-muted rounded border border-dashed border-muted-foreground/30 flex items-center justify-center"
              >
                <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
              </div>
            ))}
          </div>
          
          {printImages.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Ready to print {printImages.length} image{printImages.length !== 1 ? 's' : ''} on one page
            </p>
          )}
        </Card>
      )}
    </div>
  );
};