import html2canvas from 'html2canvas';

export interface CropData {
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  croppedAreaPixels: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export const getCroppedImg = async (
  imageSrc: string,
  cropData: CropData,
  format: 'png' | 'jpeg' = 'jpeg'
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // High DPI for print quality (300 DPI)
  const DPI = 300;
  const { dimensions, croppedAreaPixels } = cropData;
  
  const polaroidWidth = dimensions.width * DPI;
  const polaroidHeight = dimensions.height * DPI;
  
  // Calculate border sizes based on proportions
  const topBorder = polaroidHeight * 0.1; // 10% of height
  const bottomBorder = polaroidHeight * 0.166; // 16.6% of height
  const leftRightBorder = polaroidWidth * 0.05; // 5% of width each side
  
  // Image area dimensions
  const imageAreaWidth = polaroidWidth - (leftRightBorder * 2);
  const imageAreaHeight = polaroidHeight - topBorder - bottomBorder;

  canvas.width = polaroidWidth;
  canvas.height = polaroidHeight;

  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, polaroidWidth, polaroidHeight);

  // Calculate scaling factor to fit image in available space while maintaining aspect ratio
  const scaleX = imageAreaWidth / croppedAreaPixels.width;
  const scaleY = imageAreaHeight / croppedAreaPixels.height;
  const scale = Math.min(scaleX, scaleY);

  // Calculate final image dimensions and position
  const finalWidth = croppedAreaPixels.width * scale;
  const finalHeight = croppedAreaPixels.height * scale;
  
  // Center the image horizontally and align to top within the bordered area
  const x = leftRightBorder + (imageAreaWidth - finalWidth) / 2;
  const y = topBorder; // Align to top of image area

  // Draw the cropped image
  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    x,
    y,
    finalWidth,
    finalHeight
  );

  return canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.95 : 1);
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createPrintLayout = async (
  images: string[],
  layout: 2 | 4 | 8,
  paperSize: 'letter' | 'a4' = 'letter'
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Paper dimensions at 300 DPI
  const DPI = 300;
  const paperDimensions = {
    letter: { width: 8.5 * DPI, height: 11 * DPI },
    a4: { width: 8.27 * DPI, height: 11.69 * DPI }
  };

  const { width: paperWidth, height: paperHeight } = paperDimensions[paperSize];
  canvas.width = paperWidth;
  canvas.height = paperHeight;

  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, paperWidth, paperHeight);

  // Calculate grid layout
  const cols = layout === 2 ? 1 : layout === 4 ? 2 : 2;
  const rows = layout === 2 ? 2 : layout === 4 ? 2 : 4;
  
  const margin = 0.5 * DPI; // 0.5 inch margins
  const availableWidth = paperWidth - (margin * 2);
  const availableHeight = paperHeight - (margin * 2);
  
  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / rows;

  // Load and draw images
  for (let i = 0; i < Math.min(images.length, layout); i++) {
    const img = await createImage(images[i]);
    const row = Math.floor(i / cols);
    const col = i % cols;
    
    const x = margin + (col * cellWidth) + (cellWidth - img.width * 0.3) / 2;
    const y = margin + (row * cellHeight) + (cellHeight - img.height * 0.3) / 2;
    
    ctx.drawImage(img, x, y, img.width * 0.3, img.height * 0.3);
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};