import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiBurst() {
  useEffect(() => {
    // Main burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fbbf24', '#f87171'],
      scalar: 1.1,
      ticks: 200,
      zIndex: 9999,
    });
    // Left burst
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors: ['#a78bfa', '#f472b6', '#34d399', '#fbbf24'],
      scalar: 0.9,
      zIndex: 9999,
    });
    // Right burst
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors: ['#60a5fa', '#f87171', '#fbbf24', '#34d399'],
      scalar: 0.9,
      zIndex: 9999,
    });
    // Emoji burst (stars and hearts)
    confetti({
      particleCount: 30,
      spread: 90,
      origin: { y: 0.5 },
      shapes: ['star'],
      colors: ['#fff', '#fbbf24', '#f472b6'],
      scalar: 1.3,
      zIndex: 9999,
    });
    confetti({
      particleCount: 20,
      spread: 100,
      origin: { y: 0.5 },
      shapes: ['circle'],
      colors: ['#f87171', '#a78bfa', '#34d399'],
      scalar: 1.2,
      zIndex: 9999,
    });
  }, []);
  return null;
} 