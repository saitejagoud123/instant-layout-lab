import { useState } from 'react';
import { Printer, Download, Grid3X3, Grid2X2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createPrintLayout, downloadImage } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface PrintLayoutDialogProps {
  printImages: string[];
  onClearPrintLayout: () => void;
}

export const PrintLayoutDialog = ({ printImages, onClearPrintLayout }: PrintLayoutDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [layout, setLayout] = useState<2 | 4 | 8>(4);
  const [paperSize, setPaperSize] = useState<'letter' | 'a4'>('letter');
  const { toast } = useToast();

  const handleGeneratePrintLayout = async () => {
    if (printImages.length === 0) {
      toast({
        title: "No images to print",
        description: "Add some images to the print layout first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const printLayoutImage = await createPrintLayout(printImages, layout, paperSize);
      const filename = `polaroid-print-layout-${Date.now()}.jpg`;
      downloadImage(printLayoutImage, filename);
      
      toast({
        title: "Print layout ready!",
        description: `Your print layout has been saved as ${filename}`,
      });
    } catch (error) {
      console.error('Print layout generation failed:', error);
      toast({
        title: "Print layout failed",
        description: "There was an error creating the print layout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getLayoutIcon = (layoutType: number) => {
    switch (layoutType) {
      case 2: return <Grid2X2 className="w-4 h-4" />;
      case 4: return <Grid3X3 className="w-4 h-4" />;
      case 8: return <LayoutGrid className="w-4 h-4" />;
      default: return <Grid3X3 className="w-4 h-4" />;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={printImages.length === 0}
          className="w-full"
        >
          <Printer className="w-4 h-4 mr-2" />
          Create Print Layout ({printImages.length})
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Print Layout Options
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Images per page</label>
            <Select value={layout.toString()} onValueChange={(value) => setLayout(parseInt(value) as 2 | 4 | 8)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2" className="flex items-center">
                  <div className="flex items-center gap-2">
                    <Grid2X2 className="w-4 h-4" />
                    2 images (1×2 grid)
                  </div>
                </SelectItem>
                <SelectItem value="4" className="flex items-center">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4" />
                    4 images (2×2 grid)
                  </div>
                </SelectItem>
                <SelectItem value="8" className="flex items-center">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    8 images (2×4 grid)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Paper size</label>
            <Select value={paperSize} onValueChange={(value: 'letter' | 'a4') => setPaperSize(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">Letter (8.5×11 inches)</SelectItem>
                <SelectItem value="a4">A4 (8.3×11.7 inches)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Images ready:</strong> {printImages.length} / {layout}
            </p>
            {printImages.length > layout && (
              <p className="text-sm text-muted-foreground mt-1">
                Only the first {layout} images will be used.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGeneratePrintLayout}
              disabled={isGenerating || printImages.length === 0}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Download Print Layout'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={onClearPrintLayout}
              disabled={printImages.length === 0}
            >
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};