'use client';
import { motion } from 'framer-motion';

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div 
        animate={{ 
          x: [0, 100, -50, 0], 
          y: [0, -50, 100, 0],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} 
      />
      <motion.div 
        animate={{ 
          x: [0, -100, 50, 0], 
          y: [0, 100, -50, 0],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} 
      />
      <motion.div 
        animate={{ 
          x: [0, 50, -100, 0], 
          y: [0, 50, -100, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[40%] w-[700px] h-[700px] rounded-full opacity-[0.05] blur-[130px]"
        style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} 
      />
    </div>
  );
}
