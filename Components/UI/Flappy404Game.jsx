'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, Zap, Volume2, VolumeX } from 'lucide-react';
import WaitlistHeader from '@/Components/Waitlist/Components/WaitlistHeader';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const GRAVITY = 0.63;
const JUMP = -8.5;
const OBSTACLE_WIDTH = 60;
const BASE_OBSTACLE_GAP = 160;
const BASE_OBSTACLE_SPEED = 3.2;
const PLAYER_SIZE = 45;
const PLAYER_X = 100;

// Unique ID generator to prevent React key conflicts
let uniqueIdCounter = 0;
const generateUniqueId = () => {
  return `game-${Date.now()}-${++uniqueIdCounter}`;
};

// Enhanced haptic feedback
const triggerHaptic = (type = 'light') => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50],
      score: [10, 50, 10],
      gameOver: [100, 50, 100],
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }
};

// Screen shake effect (optimized)
const useScreenShake = () => {
  const [shake, setShake] = useState({ x: 0, y: 0 });

  const triggerShake = (intensity = 1) => {
    const maxShake = intensity * 4; // Reduced intensity
    setShake({
      x: (Math.random() - 0.5) * maxShake,
      y: (Math.random() - 0.5) * maxShake,
    });

    setTimeout(() => setShake({ x: 0, y: 0 }), 100); // Shorter duration
  };

  return { shake, triggerShake };
};

// Enhanced particle system (integrated with main game loop)
const useParticleSystem = () => {
  const [particles, setParticles] = useState([]);
  const particlesRef = useRef([]);

  const addParticles = (x, y, type = 'default', count = 5) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: generateUniqueId(),
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        decay: 0.02 + Math.random() * 0.02,
        size: Math.random() * 6 + 2,
        type,
        color: type === 'score' ? '#10b981' : type === 'explosion' ? '#ef4444' : '#8b5cf6',
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
    setParticles(particlesRef.current);
  };

  const updateParticles = (dt = 1) => {
    particlesRef.current = particlesRef.current
      .map(p => ({
        ...p,
        x: p.x + p.vx * dt * 0.5,
        y: p.y + p.vy * dt * 0.5,
        vy: p.vy + 0.2 * dt, // gravity
        life: p.life - p.decay * dt,
      }))
      .filter(p => p.life > 0);

    setParticles([...particlesRef.current]);
  };

  return { particles, addParticles, updateParticles };
};

// Add a seeded random generator for SSR
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Completely revamped obstacle generation with earlier start and progressive difficulty
function generateObstacle(score, lastObstacle = null, seed = 12345) {
  const difficultyPhases = {
    // Tutorial phase - very easy and forgiving (0-2)
    tutorial: [
      { gapY: 120, gap: 190, spacing: 240 },
      { gapY: 140, gap: 185, spacing: 260 },
      { gapY: 100, gap: 195, spacing: 220 },
      { gapY: 160, gap: 180, spacing: 250 },
    ],
    // Beginner phase - still easy but introducing variation (3-6)
    beginner: [
      { gapY: 90, gap: 175, spacing: 220 },
      { gapY: 150, gap: 170, spacing: 240 },
      { gapY: 70, gap: 180, spacing: 200 },
      { gapY: 170, gap: 165, spacing: 230 },
      { gapY: 110, gap: 175, spacing: 210 },
    ],
    // Intermediate phase - moderate challenge (7-12)
    intermediate: [
      { gapY: 60, gap: 160, spacing: 200 },
      { gapY: 180, gap: 155, spacing: 220 },
      { gapY: 40, gap: 165, spacing: 190 },
      { gapY: 200, gap: 150, spacing: 210 },
      { gapY: 80, gap: 158, spacing: 180 },
      { gapY: 190, gap: 162, spacing: 200 },
    ],
    // Advanced phase - getting challenging (13-20)
    advanced: [
      { gapY: 30, gap: 145, spacing: 180 },
      { gapY: 220, gap: 140, spacing: 200 },
      { gapY: 50, gap: 150, spacing: 170 },
      { gapY: 210, gap: 135, spacing: 190 },
      { gapY: 20, gap: 155, spacing: 160 },
      { gapY: 230, gap: 142, spacing: 185 },
    ],
    // Expert phase - very challenging (21+)
    expert: [
      { gapY: 15, gap: 130, spacing: 160 },
      { gapY: 250, gap: 125, spacing: 180 },
      { gapY: 35, gap: 135, spacing: 150 },
      { gapY: 240, gap: 120, spacing: 170 },
      { gapY: 10, gap: 140, spacing: 140 },
      { gapY: 260, gap: 128, spacing: 165 },
    ],
  };

  let phase = 'tutorial';
  if (score >= 21) phase = 'expert';
  else if (score >= 13) phase = 'advanced';
  else if (score >= 7) phase = 'intermediate';
  else if (score >= 3) phase = 'beginner';

  const availablePatterns = difficultyPhases[phase];
  let randomFn = typeof window !== 'undefined' ? Math.random : seededRandom(seed);
  let selectedPattern = availablePatterns[Math.floor(randomFn() * availablePatterns.length)];

  // Improved anti-repetition logic for more natural obstacle flow
  if (lastObstacle) {
    const heightDiff = Math.abs(selectedPattern.gapY - lastObstacle.gapY);

    // Avoid very similar heights or extreme consecutive changes
    if (heightDiff < 50 && randomFn() > 0.25) {
      const variedPatterns = availablePatterns.filter(p => {
        const diff = Math.abs(p.gapY - lastObstacle.gapY);
        return diff > 70 && diff < 180; // Not too similar, not too extreme
      });
      if (variedPatterns.length > 0) {
        selectedPattern = variedPatterns[Math.floor(randomFn() * variedPatterns.length)];
      }
    }

    // Also avoid too extreme jumps that feel unnatural
    if (heightDiff > 200 && randomFn() > 0.6) {
      const moderatePatterns = availablePatterns.filter(
        p => Math.abs(p.gapY - lastObstacle.gapY) < 150
      );
      if (moderatePatterns.length > 0) {
        selectedPattern = moderatePatterns[Math.floor(randomFn() * moderatePatterns.length)];
      }
    }
  }

  // Add natural micro-variations for organic feel
  const gapVariation = (randomFn() - 0.5) * 12;
  const sizeVariation = (randomFn() - 0.5) * 8;
  const spacingVariation = (randomFn() - 0.5) * 25;

  return {
    gapY: Math.max(
      30,
      Math.min(GAME_HEIGHT - selectedPattern.gap - 30, selectedPattern.gapY + gapVariation)
    ),
    gap: Math.max(120, selectedPattern.gap + sizeVariation),
    spacing: Math.max(120, selectedPattern.spacing + spacingVariation),
    phase,
    difficulty: score,
  };
}

// Enhanced speed progression
function getObstacleSpeed(score) {
  // More gradual speed increase with caps per phase
  const baseSpeed = BASE_OBSTACLE_SPEED;
  const speedBonus = Math.floor(score / 3) * 0.3; // Increase every 3 points
  const maxSpeed = score < 10 ? 4.5 : score < 20 ? 5.5 : 6.8;

  return Math.min(baseSpeed + speedBonus, maxSpeed);
}

// Enhanced Button component with better animations
function GameButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0';

  const variants = {
    primary:
      'bg-violet-600 text-white shadow-lg hover:bg-violet-700 hover:shadow-violet-500/25 focus:ring-violet-500/30 transform hover:scale-105 active:scale-95',
    secondary:
      'bg-violet-100 text-violet-700 border border-violet-200 shadow-sm hover:bg-violet-200 hover:border-violet-300 focus:ring-violet-500/20',
    ghost: 'hover:bg-violet-50 hover:text-violet-600 focus:ring-violet-500/20',
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${className} h-10 px-6`}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Enhanced floating particles background
function GameParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    let randomFn = typeof window !== 'undefined' ? Math.random : seededRandom(404);
    const particleCount = 15;
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: randomFn() * 100,
        y: randomFn() * 100,
        size: randomFn() * 4 + 1,
        duration: randomFn() * 10 + 15,
        delay: randomFn() * 8,
        opacity: randomFn() * 0.4 + 0.1,
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full bg-violet-500/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-30, -120],
            opacity: [0, particle.opacity, 0],
            scale: [0.3, 1, 0.3],
            rotate: [0, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Enhanced grid background with subtle animation
function GameGrid() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      animate={{
        backgroundPosition: ['0px 0px', '20px 20px'],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <div
        className="absolute inset-0 transition-colors duration-300"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(139, 92, 246, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.08) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.6,
        }}
      />
    </motion.div>
  );
}

function Flappy404Game() {
  const [playerY, setPlayerY] = useState(GAME_HEIGHT / 2 - PLAYER_SIZE / 2);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState(() => {
    // Start with obstacles much earlier
    const firstObstacle = generateObstacle(0);
    return [
      {
        x: GAME_WIDTH - 150, // Much closer start
        gapY: firstObstacle.gapY,
        gap: firstObstacle.gap,
        passed: false,
        id: generateUniqueId(),
        phase: firstObstacle.phase,
        difficulty: 0,
      },
    ];
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [nextObstacleDistance, setNextObstacleDistance] = useState(200);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const requestRef = useRef();
  const { shake, triggerShake } = useScreenShake();
  const { particles, addParticles, updateParticles } = useParticleSystem();

  const gameStateRef = useRef({
    playerY: GAME_HEIGHT / 2 - PLAYER_SIZE / 2,
    velocity: 0,
    obstacles: [],
    score: 0,
    gameOver: false,
    started: false,
  });

  // Initialize best score from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flappy404-best');
      if (saved) setBestScore(parseInt(saved, 10));
    }
  }, []);

  // Save best score
  useEffect(() => {
    if (typeof window !== 'undefined' && bestScore > 0) {
      localStorage.setItem('flappy404-best', bestScore.toString());
    }
  }, [bestScore]);

  // Update ref when state changes
  useEffect(() => {
    gameStateRef.current = { playerY, velocity, obstacles, score, gameOver, started };
  }, [playerY, velocity, obstacles, score, gameOver, started]);

  // Enhanced jump function with haptic feedback
  const jump = useCallback(
    e => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const currentState = gameStateRef.current;

      if (!currentState.started) {
        setStarted(true);
        triggerHaptic('light');
      }

      if (!currentState.gameOver) {
        // Natural jump physics - more responsive and controlled
        const currentVel = currentState.velocity;
        let jumpPower = JUMP;

        // Adjust jump based on current velocity for more natural feel
        if (currentVel > 4) {
          jumpPower = JUMP * 1.1; // Slightly stronger when falling fast
        } else if (currentVel < -1) {
          jumpPower = JUMP * 0.8; // Weaker when already rising
        }

        setVelocity(jumpPower);

        // Add jump particles
        addParticles(PLAYER_X + PLAYER_SIZE / 2, currentState.playerY + PLAYER_SIZE / 2, 'jump', 3);

        // Haptic feedback
        triggerHaptic('light');
      }
    },
    [addParticles]
  );

  // Enhanced restart function
  const restart = useCallback(() => {
    const firstObstacle = generateObstacle(0);
    const newObstacle = {
      x: GAME_WIDTH - 150, // Closer start
      gapY: firstObstacle.gapY,
      gap: firstObstacle.gap,
      passed: false,
      id: generateUniqueId(),
      phase: firstObstacle.phase,
      difficulty: 0,
    };

    setPlayerY(GAME_HEIGHT / 2 - PLAYER_SIZE / 2);
    setVelocity(0);
    setRotation(0);
    setObstacles([newObstacle]);
    setScore(0);
    setGameOver(false);
    setStarted(false);
    setNextObstacleDistance(200);

    // Cancel any existing animation frame
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  }, []);

  // Enhanced collision detection with more realistic hitboxes
  const checkCollisions = useCallback((currentPlayerY, currentObstacles) => {
    // Ground and ceiling collision with slight tolerance
    if (currentPlayerY >= GAME_HEIGHT - PLAYER_SIZE - 2) return true;
    if (currentPlayerY <= 2) return true;

    // More precise collision with circular hitbox simulation
    const playerCenterX = PLAYER_X + PLAYER_SIZE / 2;
    const playerCenterY = currentPlayerY + PLAYER_SIZE / 2;
    const radius = (PLAYER_SIZE * 0.7) / 2; // Slightly smaller radius for fairness

    for (let obs of currentObstacles) {
      // Check collision with top obstacle
      if (
        playerCenterX + radius > obs.x &&
        playerCenterX - radius < obs.x + OBSTACLE_WIDTH &&
        playerCenterY - radius < obs.gapY
      ) {
        return true;
      }

      // Check collision with bottom obstacle
      if (
        playerCenterX + radius > obs.x &&
        playerCenterX - radius < obs.x + OBSTACLE_WIDTH &&
        playerCenterY + radius > obs.gapY + obs.gap
      ) {
        return true;
      }
    }

    return false;
  }, []);

  // Enhanced game loop with better physics and feedback
  useEffect(() => {
    if (!started || gameOver) return;

    let lastTime = performance.now();

    function loop(now) {
      const dt = Math.min((now - lastTime) / 16.67, 1.5);
      lastTime = now;

      const currentState = gameStateRef.current;

      if (!currentState.started || currentState.gameOver) {
        return;
      }

      // Natural physics - balanced and responsive
      const maxFallSpeed = 12;
      const gravityMultiplier = currentState.velocity > 0 ? 1.1 : 0.9; // Slightly faster fall, natural rise
      let newVelocity = currentState.velocity + GRAVITY * gravityMultiplier * dt;

      if (newVelocity > 0) {
        newVelocity = Math.min(newVelocity, maxFallSpeed);
      }

      let newPlayerY = currentState.playerY + newVelocity * dt;

      // Natural rotation that follows velocity smoothly
      const targetRotation = Math.max(-25, Math.min(45, newVelocity * 2.8));
      const rotationSpeed = 0.2;
      const smoothRotation = rotation + (targetRotation - rotation) * rotationSpeed;
      setRotation(smoothRotation);

      // Boundary constraints with better bounce physics
      if (newPlayerY < 0) {
        newPlayerY = 0;
        newVelocity = Math.max(0, newVelocity * 0.2);
        triggerShake(0.3);
      }
      if (newPlayerY > GAME_HEIGHT - PLAYER_SIZE) {
        newPlayerY = GAME_HEIGHT - PLAYER_SIZE;
        newVelocity = Math.min(0, newVelocity * 0.2);
        triggerShake(0.3);
      }

      // Enhanced obstacle movement with better spacing
      const currentSpeed = getObstacleSpeed(currentState.score);
      let newObstacles = currentState.obstacles.map(o => ({
        ...o,
        x: o.x - currentSpeed * dt,
      }));

      // Improved obstacle generation with earlier spawning
      const lastObstacle = newObstacles[newObstacles.length - 1];
      if (lastObstacle && lastObstacle.x < GAME_WIDTH - nextObstacleDistance) {
        const newObstacleData = generateObstacle(currentState.score, lastObstacle);

        newObstacles.push({
          x: GAME_WIDTH + 20, // Closer spawn
          gapY: newObstacleData.gapY,
          gap: newObstacleData.gap,
          passed: false,
          id: generateUniqueId(),
          phase: newObstacleData.phase,
          difficulty: newObstacleData.difficulty,
        });

        setNextObstacleDistance(newObstacleData.spacing);
      }

      // Remove off-screen obstacles
      newObstacles = newObstacles.filter(o => o.x > -OBSTACLE_WIDTH);

      // Update particles in sync with game loop
      updateParticles(dt);

      // Enhanced score calculation with feedback
      let newScore = currentState.score;
      newObstacles.forEach(obs => {
        if (!obs.passed && obs.x + OBSTACLE_WIDTH < PLAYER_X) {
          obs.passed = true;
          newScore++;

          // Score feedback
          addParticles(
            PLAYER_X + PLAYER_SIZE / 2,
            currentState.playerY + PLAYER_SIZE / 2,
            'score',
            4
          );
          triggerHaptic('score');
        }
      });

      // Enhanced collision detection
      const collision = checkCollisions(newPlayerY, newObstacles);

      // Update state
      setPlayerY(newPlayerY);
      setVelocity(newVelocity);
      setObstacles(newObstacles);

      if (newScore !== currentState.score) {
        setScore(newScore);
        if (newScore > bestScore) {
          setBestScore(newScore);
        }
      }

      if (collision) {
        setGameOver(true);

        // Game over feedback
        addParticles(PLAYER_X + PLAYER_SIZE / 2, newPlayerY + PLAYER_SIZE / 2, 'explosion', 8);
        triggerShake(0.7);
        triggerHaptic('gameOver');
        return;
      }

      requestRef.current = requestAnimationFrame(loop);
    }

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [
    started,
    gameOver,
    checkCollisions,
    rotation,
    bestScore,
    nextObstacleDistance,
    addParticles,
    updateParticles,
    triggerShake,
  ]);

  // Enhanced keyboard controls
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp' || e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        jump(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Enhanced mouse/touch controls
  useEffect(() => {
    const handleClick = e => {
      e.preventDefault();
      e.stopPropagation();
      jump(e);
    };

    const handleTouch = e => {
      e.preventDefault();
      e.stopPropagation();
      jump(e);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleTouch, { passive: false });

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [jump]);

  // Get enhanced difficulty color and effects
  const getDifficultyColor = phase => {
    const colors = {
      tutorial: 'from-green-400 to-green-500',
      beginner: 'from-blue-400 to-blue-500',
      intermediate: 'from-violet-500 to-violet-600',
      advanced: 'from-red-500 to-red-600',
      expert: 'from-red-600 to-red-700',
    };
    return colors[phase] || colors.tutorial;
  };

  const getDifficultyGlow = phase => {
    const glows = {
      tutorial: 'shadow-green-500/30',
      beginner: 'shadow-blue-500/30',
      intermediate: 'shadow-violet-500/30',
      advanced: 'shadow-red-500/30',
      expert: 'shadow-red-600/40',
    };
    return glows[phase] || glows.tutorial;
  };

  return (
    <>
      <div className="flex flex-col items-center mb-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Game Container with screen shake */}
          <motion.div
            className="relative bg-gradient-to-br from-white via-violet-50/50 to-violet-100/80 rounded-2xl shadow-2xl border border-violet-200/50 overflow-hidden backdrop-blur-sm"
            style={{
              width: GAME_WIDTH,
              height: GAME_HEIGHT,
            }}
            animate={{
              x: shake.x,
              y: shake.y,
            }}
            transition={{ type: 'spring', stiffness: 1000, damping: 50 }}
            tabIndex={0}
            aria-label="Enhanced Flappy 404 mini-game"
          >
            {/* Background Effects */}
            <GameGrid />
            <GameParticles />

            {/* Enhanced gradient overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-transparent via-violet-50/20 to-violet-100/40 pointer-events-none"
              style={{ zIndex: 1 }}
            />

            {/* Animated decorative clouds */}
            <motion.div
              className="absolute top-12 left-8 w-16 h-8 bg-white/60 rounded-full opacity-70"
              animate={{
                x: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ zIndex: 2 }}
            />
            <motion.div
              className="absolute top-24 right-12 w-20 h-10 bg-white/50 rounded-full opacity-60"
              animate={{
                x: [0, -20, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              style={{ zIndex: 2 }}
            />

            {/* Enhanced Obstacles with difficulty-based styling */}
            {obstacles.map(obs => (
              <React.Fragment key={obs.id}>
                {/* Top obstacle */}
                <motion.div
                  className={`absolute bg-gradient-to-b ${getDifficultyColor(
                    obs.phase
                  )} rounded-t-xl ${getDifficultyGlow(obs.phase)}`}
                  style={{
                    left: obs.x,
                    top: 0,
                    width: OBSTACLE_WIDTH,
                    height: obs.gapY,
                    zIndex: 3,
                    boxShadow: `0 4px 20px rgba(139, 92, 246, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)`,
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-t-xl" />
                  {obs.phase === 'expert' && (
                    <motion.div
                      className="absolute inset-0 bg-red-400/20 rounded-t-xl"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Bottom obstacle */}
                <motion.div
                  className={`absolute bg-gradient-to-t ${getDifficultyColor(
                    obs.phase
                  )} rounded-b-xl ${getDifficultyGlow(obs.phase)}`}
                  style={{
                    left: obs.x,
                    top: obs.gapY + obs.gap,
                    width: OBSTACLE_WIDTH,
                    height: GAME_HEIGHT - (obs.gapY + obs.gap),
                    zIndex: 3,
                    boxShadow: `0 4px 20px rgba(139, 92, 246, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)`,
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-b-xl" />
                  {obs.phase === 'expert' && (
                    <motion.div
                      className="absolute inset-0 bg-red-400/20 rounded-b-xl"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </React.Fragment>
            ))}

            {/* Dynamic particles */}
            {particles.map(particle => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  opacity: particle.life,
                  zIndex: 5,
                }}
              />
            ))}

            {/* Enhanced Player (404) with better animations */}
            <motion.div
              className="absolute flex items-center justify-center font-black text-violet-700 bg-white/95 rounded-2xl shadow-xl backdrop-blur-sm border border-violet-200/50"
              style={{
                left: PLAYER_X,
                top: playerY,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE,
                fontSize: '18px',
                transform: `rotate(${rotation}deg)`,
                transition: started ? 'none' : 'all 0.3s ease',
                zIndex: 4,
                boxShadow:
                  '0 8px 25px rgba(139, 92, 246, 0.3), inset 0 2px 4px rgba(255,255,255,0.8)',
                textShadow: '0 2px 8px rgba(139, 92, 246, 0.4)',
              }}
              animate={
                !started
                  ? {
                      y: [0, -8, 0],
                      scale: [1, 1.08, 1],
                      boxShadow: [
                        '0 8px 25px rgba(139, 92, 246, 0.3)',
                        '0 12px 30px rgba(139, 92, 246, 0.4)',
                        '0 8px 25px rgba(139, 92, 246, 0.3)',
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              aria-label="404 player"
            >
              404
            </motion.div>

            {/* Enhanced Score display with phase indicator */}
            <motion.div
              className="absolute top-4 left-4 font-bold text-violet-700 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-violet-200/50 z-10"
              style={{
                padding: '8px 16px',
                fontSize: '18px',
                textShadow: '0 1px 3px rgba(139, 92, 246, 0.2)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              aria-label="Current score and game info"
            >
              <div>Score: {score}</div>
              {score >= 3 && (
                <div className="text-xs text-violet-500 mt-1 flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      score >= 21
                        ? 'bg-red-500'
                        : score >= 13
                        ? 'bg-orange-500'
                        : score >= 7
                        ? 'bg-violet-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  {score >= 21
                    ? 'Expert'
                    : score >= 13
                    ? 'Advanced'
                    : score >= 7
                    ? 'Intermediate'
                    : 'Beginner'}
                </div>
              )}
              {score >= 5 && (
                <div className="text-xs text-violet-500">
                  Speed: {getObstacleSpeed(score).toFixed(1)}x
                </div>
              )}
            </motion.div>

            {/* Enhanced Best score display */}
            {bestScore > 0 && (
              <motion.div
                className="absolute top-4 right-4 font-semibold text-violet-600 bg-violet-50/90 backdrop-blur-sm rounded-xl shadow-lg border border-violet-200/50 z-10 flex items-center gap-1"
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                aria-label="Best score"
              >
                <Trophy size={14} className="text-violet-500" />
                {bestScore}
              </motion.div>
            )}

            {/* Sound toggle */}
            <motion.button
              className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-violet-200/50 z-10 text-violet-600 hover:bg-violet-50"
              onClick={() => setSoundEnabled(!soundEnabled)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </motion.button>

            {/* Enhanced Game Over Overlay */}
            <AnimatePresence>
              {gameOver && (
                <motion.div
                  className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-20 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                  >
                    <motion.div
                      className="text-4xl font-black text-violet-600 mb-3"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      Game Over!
                    </motion.div>
                    <div className="text-xl text-violet-700 mb-2 font-semibold">
                      Final Score: {score}
                    </div>

                    {/* Phase achievement */}
                    {score >= 3 && (
                      <div className="text-sm text-violet-500 mb-2 flex items-center justify-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            score >= 21
                              ? 'bg-red-500'
                              : score >= 13
                              ? 'bg-orange-500'
                              : score >= 7
                              ? 'bg-violet-500'
                              : 'bg-blue-500'
                          }`}
                        />
                        Reached{' '}
                        {score >= 21
                          ? 'Expert'
                          : score >= 13
                          ? 'Advanced'
                          : score >= 7
                          ? 'Intermediate'
                          : 'Beginner'}{' '}
                        Level
                      </div>
                    )}

                    {score >= 8 && (
                      <div className="text-sm text-violet-500 mb-2">
                        Max Speed: {getObstacleSpeed(score).toFixed(1)}x
                      </div>
                    )}

                    {score === bestScore && score > 0 && (
                      <motion.div
                        className="text-sm text-violet-500 mb-4 flex items-center justify-center gap-1"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                      >
                        <Zap size={16} className="text-amber-500" />
                        New Personal Best!
                      </motion.div>
                    )}

                    <GameButton onClick={restart} className="mt-4">
                      <RotateCcw size={16} className="mr-2" />
                      Play Again
                    </GameButton>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced Start Overlay */}
            <AnimatePresence>
              {!started && !gameOver && (
                <motion.div
                  className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-center max-w-md px-6"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      className="text-4xl font-black text-violet-600 mb-3"
                      animate={{
                        scale: [1, 1.05, 1],
                        textShadow: [
                          '0 2px 8px rgba(139, 92, 246, 0.3)',
                          '0 4px 12px rgba(139, 92, 246, 0.4)',
                          '0 2px 8px rgba(139, 92, 246, 0.3)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Flappy 404
                    </motion.div>
                    <div className="text-sm text-violet-600 mb-4 leading-relaxed">
                      Navigate obstacles using <strong>SPACE</strong>, <strong>↑</strong> or{' '}
                      <strong>CLICK/TAP</strong>
                    </div>
                    <div className="text-xs text-violet-500 mb-2">
                      • Progressive difficulty with 5 phases
                    </div>
                    <div className="text-xs text-violet-500 mb-4">
                      • Enhanced physics & haptic feedback
                    </div>
                    <GameButton onClick={() => jump()}>
                      <Play size={16} className="mr-2" />
                      Start Adventure
                    </GameButton>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

export default Flappy404Game;
