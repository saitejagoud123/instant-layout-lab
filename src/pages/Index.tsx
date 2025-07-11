import { useState } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { PolaroidEditor } from '@/components/PolaroidEditor';
import { ExportSection } from '@/components/ExportSection';
import { PrintLayoutDialog } from '@/components/PrintLayoutDialog';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { CropData } from '@/utils/exportUtils';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropData, setCropData] = useState<CropData | null>(null);
  const [printImages, setPrintImages] = useState<string[]>([]);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropChange = (newCropData: CropData) => {
    setCropData(newCropData);
  };

  const handleAddToPrintLayout = (imageData: string) => {
    setPrintImages(prev => [...prev, imageData]);
  };

  const handleClearPrintLayout = () => {
    setPrintImages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-vintage rounded-lg">
              <Camera className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-vintage bg-clip-text text-transparent">
                Polaroid Studio
              </h1>
              <p className="text-sm text-muted-foreground">
                Create beautiful instant photo layouts
              </p>
            </div>
            <div className="ml-auto">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-6">
            <Card className="p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Upload Photo
              </h2>
              <ImageUpload 
                onImageUpload={handleImageUpload} 
                hasImage={!!uploadedImage}
              />
            </Card>

            {imageSrc && (
              <Card className="p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <h2 className="text-lg font-semibold mb-4">Export & Print</h2>
                <ExportSection
                  imageSrc={imageSrc}
                  cropData={cropData}
                  onAddToPrintLayout={handleAddToPrintLayout}
                  printImages={printImages}
                />
                
                <Separator className="my-4" />
                
                <PrintLayoutDialog
                  printImages={printImages}
                  onClearPrintLayout={handleClearPrintLayout}
                />
              </Card>
            )}
          </div>

          {/* Right Column - Editor */}
          <div className="lg:col-span-2 space-y-6">
            {imageSrc ? (
              <Card className="p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <h2 className="text-lg font-semibold mb-4">Edit Your Polaroid</h2>
                <PolaroidEditor
                  imageSrc={imageSrc}
                  onCropChange={handleCropChange}
                />
              </Card>
            ) : (
              <Card className="p-12 text-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-md mx-auto">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Ready to Create</h3>
                  <p className="text-muted-foreground">
                    Upload a photo to start creating your Polaroid-style layout. 
                    Drag and drop or click the upload area to begin.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>Create beautiful Polaroid layouts • Export high-quality images • Print multiple photos</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
