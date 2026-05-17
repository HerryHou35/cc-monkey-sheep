import { useEffect, useState, useRef } from 'react';

const PARTICLE_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#F472B6',
  '#34D399', '#FBBF24', '#60A5FA', '#FB7185', '#2DD4BF',
];

// Single burst particle
function BurstParticle({ angle, distance, color, size }) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * distance;
  const ty = Math.sin(rad) * distance;

  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left: '50%',
        top: '50%',
        animation: `particleFly 0.65s ease-out forwards`,
        '--tx': `${tx}px`,
        '--ty': `${ty}px`,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
    />
  );
}

export function ElimParticles({ x, y }) {
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      angle: (360 / 18) * i + Math.random() * 15,
      distance: 40 + Math.random() * 70,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      size: 4 + Math.random() * 8,
    }))
  );

  return (
    <div
      className="fixed pointer-events-none z-[55]"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <style>{`
        @keyframes particleFly {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <BurstParticle key={p.id} {...p} />
      ))}
    </div>
  );
}

// Confetti for victory
function ConfettiPiece({ delay, color, left, size, rotation }) {
  return (
    <div
      className="absolute rounded-sm pointer-events-none"
      style={{
        width: size,
        height: size * 0.6,
        background: color,
        left: `${left}%`,
        top: -20,
        animation: `confettiFall ${2.5 + Math.random() * 2}s ease-in ${delay}s forwards`,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
}

export function VictoryConfetti({ active }) {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.8,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      left: Math.random() * 100,
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
    }))
  );

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[55] overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} {...p} />
      ))}
    </div>
  );
}

// Defeat particles (red shake bits)
export function DefeatParticles({ active }) {
  const [pieces] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.3,
      left: 30 + Math.random() * 40,
      size: 3 + Math.random() * 6,
    }))
  );

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[55] overflow-hidden">
      <style>{`
        @keyframes defeatDrop {
          0% { transform: translateY(-20px) scale(1); opacity: 1; }
          100% { transform: translateY(60px) scale(0); opacity: 0; }
        }
      `}</style>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: '#ef4444',
            left: `${p.left}%`,
            top: '85%',
            animation: `defeatDrop ${0.5 + Math.random() * 0.5}s ease-out ${p.delay}s forwards`,
            boxShadow: `0 0 ${p.size * 3}px #ef4444`,
          }}
        />
      ))}
    </div>
  );
}
