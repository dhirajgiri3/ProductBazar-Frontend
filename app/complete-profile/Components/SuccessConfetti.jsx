"use client";

import { useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

const SuccessConfetti = ({ trigger = true, duration = 7000 }) => {
  const createCanvas = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    Object.assign(canvas.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "1000",
      pointerEvents: "none",
      backgroundColor: "transparent",
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    return canvas;
  }, []);

  // Helper function for random values
  const randomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  // Create a firework effect
  const firework = useCallback((myConfetti, x, y, colors) => {
    const particleCount = 100;

    return myConfetti({
      particleCount,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { x, y },
      colors: colors,
      velocity: randomInRange(25, 30),
      drift: randomInRange(-0.4, 0.4),
      ticks: 300,
      shapes: ["circle", "square"],
      scalar: randomInRange(0.9, 1.2),
      gravity: 1.2,
      decay: 0.94,
      zIndex: 100
    });
  }, []);

  // Create a glitter effect
  const glitter = useCallback((myConfetti, x, y, colors) => {
    return myConfetti({
      particleCount: 60,
      angle: randomInRange(0, 360),
      spread: 360,
      startVelocity: randomInRange(15, 25),
      origin: { x, y },
      colors: colors,
      shapes: ["star"],
      ticks: 200,
      scalar: 0.8,
      gravity: 0.6,
      decay: 0.95,
      drift: 0,
      zIndex: 100
    });
  }, []);

  // Create a burst effect
  const burst = useCallback((myConfetti, x, y, colors) => {
    return myConfetti({
      particleCount: 120,
      angle: randomInRange(0, 360),
      spread: 360,
      startVelocity: 40,
      decay: 0.9,
      gravity: 1,
      drift: 0,
      ticks: 200,
      origin: { x, y },
      colors: colors,
      shapes: ["circle", "square"],
      scalar: randomInRange(0.8, 1.2),
      zIndex: 100
    });
  }, []);

  // Create a ribbon effect
  const ribbon = useCallback((myConfetti, x, y, colors) => {
    return myConfetti({
      particleCount: 150,
      angle: randomInRange(30, 150),
      spread: randomInRange(20, 60),
      origin: { x, y },
      colors: colors,
      startVelocity: randomInRange(25, 45),
      decay: 0.94,
      gravity: 0.8,
      drift: randomInRange(-0.1, 0.1),
      ticks: 400,
      scalar: 0.8,
      shapes: ["square"],
      zIndex: 100
    });
  }, []);

  // Create a shower effect
  const shower = useCallback((myConfetti, colors) => {
    const end = Date.now() + 1500;
    const interval = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      myConfetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.25 },
        colors: colors,
        ticks: 300,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 45,
        shapes: ["square", "circle"]
      });

      myConfetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.25 },
        colors: colors,
        ticks: 300,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 45,
        shapes: ["square", "circle"]
      });
    }, 50);

    return interval;
  }, []);

  // Launch the celebration sequence
  const launchCelebration = useCallback((myConfetti) => {
    // Vibrant color palette with violet as the accent color
    const colors = [
      "#8A2BE2", // Violet (accent)
      "#9370DB", // Medium Purple
      "#BA55D3", // Medium Orchid
      "#FF69B4", // Hot Pink
      "#FFD700", // Gold
      "#00BFFF", // Deep Sky Blue
      "#32CD32", // Lime Green
      "#FF4500", // Orange Red
      "#E6BE8A", // Champagne
      "#39FF14", // Neon Green
      "#FF10F0", // Bright Pink
      "#7B68EE", // Medium Slate Blue
      "#FF1493", // Deep Pink
      "#00CED1", // Dark Turquoise
      "#FF8C00", // Dark Orange
    ];

    // Sequence of effects
    let intervals = [];

    // Initial center burst
    setTimeout(() => {
      burst(myConfetti, 0.5, 0.5, colors);
    }, 0);

    // Side bursts
    setTimeout(() => {
      burst(myConfetti, 0.2, 0.5, colors);
      burst(myConfetti, 0.8, 0.5, colors);
    }, 300);

    // Fireworks
    setTimeout(() => {
      firework(myConfetti, 0.3, 0.5, colors);
      firework(myConfetti, 0.7, 0.5, colors);
    }, 800);

    // Glitter effect
    setTimeout(() => {
      glitter(myConfetti, 0.5, 0.4, colors);
    }, 1200);

    // Ribbon effects
    setTimeout(() => {
      ribbon(myConfetti, 0.1, 0.5, colors);
      ribbon(myConfetti, 0.9, 0.5, colors);
    }, 1600);

    // Final burst
    setTimeout(() => {
      burst(myConfetti, 0.5, 0.3, colors);
    }, 2000);

    // Continuous shower for a short period
    setTimeout(() => {
      const showerInterval = shower(myConfetti, colors);
      intervals.push(showerInterval);
    }, 2500);

    // Final glitter
    setTimeout(() => {
      glitter(myConfetti, 0.3, 0.7, colors);
      glitter(myConfetti, 0.7, 0.7, colors);
    }, 3500);

    return intervals;
  }, [burst, firework, glitter, ribbon, shower]);

  useEffect(() => {
    if (!trigger) return;

    // Clean up any existing canvas
    document.querySelector(".confetti-canvas")?.remove();

    // Create new canvas
    const canvas = createCanvas();
    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true // Use a worker thread for better performance
    });

    // Launch the celebration
    const intervals = launchCelebration(myConfetti);

    // Set up cleanup
    const cleanupTimer = setTimeout(() => {
      canvas.remove();
      intervals.forEach(interval => clearInterval(interval));
    }, duration);

    return () => {
      clearTimeout(cleanupTimer);
      intervals.forEach(interval => clearInterval(interval));
      canvas.remove();
    };
  }, [trigger, duration, createCanvas, launchCelebration]);

  return null;
};

export default SuccessConfetti;
