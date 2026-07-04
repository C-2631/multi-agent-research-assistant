import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../index.css'; // Ensure CSS is applied

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  
  const loadingTexts = [
    "Opening the archives...",
    "Scanning research papers...",
    "Formulating hypotheses...",
    "Finding answers..."
  ];

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 500);
          return 100;
        }
        return p + 2;
      });
    }, 50);

    const textInterval = setInterval(() => {
      setTextIndex(i => (i + 1) % loadingTexts.length);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="loading-screen-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div className="book-animation-container">
        {/* CSS 3D Book */}
        <div className="book">
          <div className="book-page left-page"></div>
          <div className="book-page right-page page-flip"></div>
          <div className="book-page right-page page-flip-delayed"></div>
        </div>
      </div>

      <motion.div 
        className="loading-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: '3rem', textAlign: 'center' }}
      >
        <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          {loadingTexts[textIndex]}
        </h2>
        
        {/* Progress bar */}
        <div style={{ 
          width: '250px', 
          height: '4px', 
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <motion.div 
            style={{ height: '100%', background: 'var(--color-accent)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>

      <style>{`
        .book-animation-container {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .book {
          width: 120px;
          height: 80px;
          position: relative;
          transform: rotateX(45deg) rotateY(-20deg);
          transform-style: preserve-3d;
        }
        .book-page {
          position: absolute;
          width: 60px;
          height: 80px;
          background: linear-gradient(135deg, #fff 0%, #e2e8f0 100%);
          border-radius: 2px 6px 6px 2px;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1), 2px 4px 10px rgba(0,0,0,0.3);
          transform-origin: left center;
        }
        .left-page {
          left: 0;
          transform-origin: right center;
          transform: rotateY(-20deg);
          border-radius: 6px 2px 2px 6px;
        }
        .right-page {
          left: 60px;
        }
        @keyframes pageFlip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(-180deg); }
        }
        .page-flip {
          animation: pageFlip 2s cubic-bezier(0.645, 0.045, 0.355, 1) infinite;
        }
        .page-flip-delayed {
          animation: pageFlip 2s cubic-bezier(0.645, 0.045, 0.355, 1) infinite;
          animation-delay: 0.3s;
        }
      `}</style>
    </motion.div>
  );
}
