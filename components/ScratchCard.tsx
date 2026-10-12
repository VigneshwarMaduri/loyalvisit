'use client';

import { useRef, useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface ScratchCardProps {
  rewardText: string;
  isUnlocked?: boolean;
  onReveal?: () => void;
}

export default function ScratchCard({ rewardText, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratched, setIsScratched] = useState(false);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Draw silver gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#94a3b8');
    gradient.addColorStop(0.5, '#cbd5e1');
    gradient.addColorStop(1, '#64748b');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Text instructions on the silver foil
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Scratch here to reveal ✨', width / 2, height / 2);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    if (!isScratched) {
      setIsScratched(true);
      if (onReveal) onReveal();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDrawing.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDrawing.current = true;
    if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing.current) return;
    if (e.touches[0]) scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
  };

  return (
    <div className="relative w-full h-44 rounded-2xl overflow-hidden shadow-lg border border-purple-500/30 select-none">
      {/* Underlying Reward Content */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 flex flex-col items-center justify-center p-4 text-white text-center">
        <Trophy size={32} className="text-yellow-200 mb-1 animate-bounce" />
        <span className="text-[11px] uppercase tracking-widest font-black text-yellow-200">
          Lucky Draw Revealed!
        </span>
        <h4 className="text-base font-black tracking-tight leading-snug px-3 mt-1">
          {rewardText}
        </h4>
        <span className="text-[10px] text-white/80 font-medium mt-1">
          Present at counter to claim
        </span>
      </div>

      {/* Canvas Scratch Foil Layer */}
      <canvas
        ref={canvasRef}
        width={340}
        height={176}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
}
