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

  const generateConfetti = useCallback(() => {
    const pieces: ConfettiPiece[] = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
      });
    }

    setConfetti(pieces);

    const sparklePieces = [];
    for (let i = 0; i < 20; i++) {
      sparklePieces.push({
        id: i,
        left: 20 + Math.random() * 60,
        top: 20 + Math.random() * 40,
        delay: Math.random() * 1,
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
      }, duration + 1000);

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
    <>
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
    </>
  );
}
