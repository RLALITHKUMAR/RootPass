'use client';
import { useEffect, useRef } from 'react';

export default function TopographicWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.003;

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
      ctx.lineWidth = 1;

      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        for (let j = 0; j <= width; j += 20) {
          const yOffset = Math.sin(j * 0.003 + time) * 40 + Math.cos(j * 0.002 - time * 2) * 20;
          ctx.lineTo(j, i + yOffset + (j * 0.05));
        }
        ctx.stroke();
      }
      requestAnimationFrame(animate);
    };
    
    let animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    }
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen" />;
}
