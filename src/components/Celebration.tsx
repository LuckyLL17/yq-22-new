import { useState, useEffect, useCallback } from 'react';

interface CelebrationProps {
  active: boolean;
  duration?: number;
}

const CONFETTI_COLORS = [
  '#FF6B35',
  '#FFD23F',
  '#FF5E5B',
  '#00CECB',
  '#7B61FF',
  '#FF8C42',
  '#6BCB77',
  '#4D96FF',
];

const CONFETTI_SHAPES = ['circle', 'square', 'triangle', 'rectangle'] as const;
type ConfettiShape = typeof CONFETTI_SHAPES[number];

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  shape: ConfettiShape;
  size: number;
  rotation: number;
}

export function Celebration({ active, duration = 3000 }: CelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [sparkles, setSparkles] = useState<{ id: number; left: number; top: number; delay: number; color: string }[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  const generateConfetti = useCallback(() => {
    setAnimationKey((prev) => prev + 1);
    
    const pieces: ConfettiPiece[] = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      pieces.push({
        id: i + Date.now(),
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 2.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
        size: 6 + Math.random() * 12,
        rotation: Math.random() * 360,
      });
    }

    setConfetti(pieces);

    const sparklePieces: { id: number; left: number; top: number; delay: number; color: string }[] = [];
    for (let i = 0; i < 30; i++) {
      sparklePieces.push({
        id: i + Date.now(),
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 50,
        delay: Math.random() * 1.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      });
    }
    setSparkles(sparklePieces);
  }, []);

  useEffect(() => {
    if (active) {
      generateConfetti();

      const timer = setTimeout(() => {
        setConfetti([]);
        setSparkles([]);
      }, duration + 1500);

      return () => clearTimeout(timer);
    }
  }, [active, duration, generateConfetti]);

  if (!active && confetti.length === 0) return null;

  const getShapeStyle = (shape: ConfettiShape, size: number, color: string) => {
    switch (shape) {
      case 'circle':
        return {
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
        };
      case 'square':
        return {
          width: size,
          height: size,
          backgroundColor: color,
        };
      case 'rectangle':
        return {
          width: size * 0.5,
          height: size * 1.5,
          backgroundColor: color,
        };
      case 'triangle':
        return {
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        };
      default:
        return {
          width: size,
          height: size,
          backgroundColor: color,
        };
    }
  };

  return (
    <div key={animationKey} className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="confetti"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ...getShapeStyle(piece.shape, piece.size, piece.color),
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}

      {sparkles.map((sparkle) => (
        <div
          key={`sparkle-${sparkle.id}`}
          className="fixed pointer-events-none z-[9998]"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <div
            className="sparkle animate-float-up"
            style={{
              color: sparkle.color,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
