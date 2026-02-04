import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Share2, Loader2 } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userType: 'PROFESSIONAL' | 'PATIENT';
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ isOpen, onClose, userName, userType }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  // Configuration
  const CANVAS_SIZE = 1080; // High res square
  const BACKGROUND_URL = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop";

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setTimeout(() => generateImage(), 500); // Small delay to ensure render
    }
  }, [isOpen, userName]);

  const generateImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Setup Canvas
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    // 2. Load Background
    const bgImage = new Image();
    bgImage.crossOrigin = "anonymous";
    bgImage.src = BACKGROUND_URL;

    bgImage.onload = () => {
      // Draw Background (Center Crop)
      drawImageProp(ctx, bgImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 3. Add Gradient Overlay (Dark Green to Transparent)
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
      gradient.addColorStop(0, "rgba(6, 78, 59, 0.4)"); // emerald-900 transparent
      gradient.addColorStop(0.5, "rgba(6, 78, 59, 0.8)");
      gradient.addColorStop(1, "rgba(6, 78, 59, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 4. Draw Logo Box
      const logoSize = 150;
      const logoX = (CANVAS_SIZE - logoSize) / 2;
      const logoY = 150;
      
      // Shadow
      ctx.shadowColor = "rgba(0,0,0,0.3)";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, logoX, logoY, logoSize, logoSize, 30);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw "DB" text in logo
      ctx.fillStyle = "#955251"; // Marsala
      ctx.font = "bold 80px 'Arial', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("DB", CANVAS_SIZE / 2, logoY + logoSize / 2);

      // 5. Draw App Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 40px 'Arial', sans-serif";
      ctx.fillText("Diet Braga", CANVAS_SIZE / 2, logoY + logoSize + 60);

      // 6. Draw Main Title
      const title = userType === 'PROFESSIONAL' ? "Profissional Dedicado" : "Foco no Progresso";
      ctx.fillStyle = "#34d399"; // Emerald 400
      ctx.font = "bold 30px 'Arial', sans-serif";
      ctx.letterSpacing = "4px"; // Spacing
      ctx.fillText(title.toUpperCase(), CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 50);

      // 7. Draw User Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 90px 'Arial', sans-serif";
      ctx.fillText(userName, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 150);

      // 8. Draw Motivational Quote/Stats
      const quote = userType === 'PROFESSIONAL' 
        ? "Transformando vidas através da nutrição." 
        : "Cada escolha saudável conta. Continue firme!";
      
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "italic 36px 'Arial', sans-serif";
      wrapText(ctx, quote, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 230, 800, 50);

      // 9. Draw Footer Badge
      const badgeY = CANVAS_SIZE - 150;
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      roundRect(ctx, CANVAS_SIZE/2 - 200, badgeY, 400, 60, 30);
      ctx.fill();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px 'Arial', sans-serif";
      ctx.fillText("www.dietbraga.com.br", CANVAS_SIZE / 2, badgeY + 32);

      setIsGenerating(false);
    };
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `diet-braga-conquista-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Helper function to draw image cover
  function drawImageProp(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, offsetX = 0.5, offsetY = 0.5) {
    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    if (offsetX < 0) offsetX = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY < 0) offsetY = 0;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill    
    if (nw < w) ar = w / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
  }

  // Helper for Rounded Rect
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Helper for wrapping text
  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" style={{zIndex: 9999}}>
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors"
        >
            <X size={20} />
        </button>

        <div className="p-6 text-center border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Compartilhar Progresso</h3>
            <p className="text-sm text-gray-500">Gere um card exclusivo para suas redes sociais.</p>
        </div>

        <div className="bg-gray-100 p-6 flex items-center justify-center relative min-h-[300px]">
            {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                    <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
                    <p className="text-xs font-bold text-gray-500">Gerando imagem...</p>
                </div>
            )}
            <canvas 
                ref={canvasRef} 
                className="w-full h-auto shadow-xl rounded-xl max-w-[350px]"
                style={{ aspectRatio: '1/1' }}
            />
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
            <button 
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <Download size={20} /> Baixar Imagem
            </button>
            <p className="text-[10px] text-gray-400 text-center mt-3">
                A imagem será salva no seu dispositivo. Compartilhe no Instagram Stories ou WhatsApp!
            </p>
        </div>
      </div>
    </div>
  );
};

export default CelebrationModal;