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
  text?: string;
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
  const { dimensions, croppedAreaPixels, text } = cropData;
  
  const polaroidWidth = dimensions.width * DPI;
  const polaroidHeight = dimensions.height * DPI;
  const imageHeight = polaroidHeight * 0.7; // 70% for image
  const whiteSpaceHeight = polaroidHeight * 0.3; // 30% for white space

  canvas.width = polaroidWidth;
  canvas.height = polaroidHeight;

  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, polaroidWidth, polaroidHeight);

  // Calculate scaling factor for high DPI
  const scaleX = polaroidWidth / croppedAreaPixels.width;
  const scaleY = imageHeight / croppedAreaPixels.height;
  const scale = Math.min(scaleX, scaleY);

  // Calculate final image dimensions and position
  const finalWidth = croppedAreaPixels.width * scale;
  const finalHeight = croppedAreaPixels.height * scale;
  const x = (polaroidWidth - finalWidth) / 2;
  const y = (imageHeight - finalHeight) / 2;

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

  // Add text if provided
  if (text && text.trim()) {
    const fontSize = Math.max(24, polaroidWidth * 0.03); // Responsive font size
    ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Word wrap text
    const maxWidth = polaroidWidth * 0.8; // 80% of width for padding
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    // Draw each line
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    const startY = imageHeight + (whiteSpaceHeight - totalTextHeight) / 2 + fontSize / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line, polaroidWidth / 2, startY + index * lineHeight);
    });
  }

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