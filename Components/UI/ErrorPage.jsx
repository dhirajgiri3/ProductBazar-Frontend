import React, { useEffect, useState } from "react";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import { cn } from "../../Lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

// Button component - preserved from original
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm shadow-black/5 hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm shadow-black/5 hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm shadow-black/5 hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm shadow-black/5 hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Enhanced 3D Shape Component
function Abstract3DShape({ className, ...props }) {
  return (
    <div
      className={cn("absolute w-64 h-64 md:w-80 md:h-80", className)}
      {...props}
      style={{
        position: "absolute",
        ...props.style,
      }}
    >
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        className="animate-rotate-slow drop-shadow-xl"
      >
        <defs>
          <linearGradient
            id="shapeGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "var(--primary)", stopOpacity: 0.1 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--primary)", stopOpacity: 0.4 }}
            />
          </linearGradient>
        </defs>
        <path
          d="M123.5 68C158.7 32.8 214.3 32.8 249.5 68L332 150.5C367.2 185.7 367.2 241.3 332 276.5L249.5 359C214.3 394.2 158.7 394.2 123.5 359L41 276.5C5.8 241.3 5.8 185.7 41 150.5L123.5 68Z"
          fill="url(#shapeGradient)"
          className="animate-morph"
          strokeWidth="2"
          strokeDasharray="10,5"
          stroke="var(--primary)"
          strokeOpacity="0.3"
        />
      </svg>
    </div>
  );
}

// Enhanced Geometric Decoration
function GeometricDecoration({ className, ...props }) {
  return (
    <div
      className={cn("absolute w-48 h-48 md:w-60 md:h-60", className)}
      {...props}
      style={{
        position: "absolute",
        ...props.style,
      }}
    >
      <svg
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        className="animate-rotate-reverse"
      >
        <defs>
          <radialGradient
            id="circleGradient"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop
              offset="0%"
              style={{ stopColor: "var(--primary)", stopOpacity: 0.05 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "var(--primary)", stopOpacity: 0.25 }}
            />
          </radialGradient>
        </defs>
        <circle
          cx="150"
          cy="150"
          r="100"
          fill="url(#circleGradient)"
          className="animate-pulse-slow"
        />
        <circle
          cx="150"
          cy="150"
          r="150"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1"
          strokeOpacity="0.2"
          strokeDasharray="15,10"
        />
        <circle
          cx="150"
          cy="150"
          r="50"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeOpacity="0.3"
          strokeDasharray="5,3"
        />
      </svg>
    </div>
  );
}

// Improved 404 Illustration with animation
function Illustration(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 362 145"
      className="animate-floating filter drop-shadow-lg"
      {...props}
    >
      <defs>
        <linearGradient id="numberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "var(--primary)", stopOpacity: 0.08 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "var(--primary)", stopOpacity: 0.06 }}
          />
        </linearGradient>
      </defs>
      <path
        fill="url(#numberGradient)"
        d="M62.6 142c-2.133 0-3.2-1.067-3.2-3.2V118h-56c-2 0-3-1-3-3V92.8c0-1.333.4-2.733 1.2-4.2L58.2 4c.8-1.333 2.067-2 3.8-2h28c2 0 3 1 3 3v85.4h11.2c.933 0 1.733.333 2.4 1 .667.533 1 1.267 1 2.2v21.2c0 .933-.333 1.733-1 2.4-.667.533-1.467.8-2.4.8H93v20.8c0 2.133-1.067 3.2-3.2 3.2H62.6zM33 90.4h26.4V51.2L33 90.4zM181.67 144.6c-7.333 0-14.333-1.333-21-4-6.666-2.667-12.866-6.733-18.6-12.2-5.733-5.467-10.266-13-13.6-22.6-3.333-9.6-5-20.667-5-33.2 0-12.533 1.667-23.6 5-33.2 3.334-9.6 7.867-17.133 13.6-22.6 5.734-5.467 11.934-9.533 18.6-12.2 6.667-2.8 13.667-4.2 21-4.2 7.467 0 14.534 1.4 21.2 4.2 6.667 2.667 12.8 6.733 18.4 12.2 5.734 5.467 10.267 13 13.6 22.6 3.334 9.6 5 20.667 5 33.2 0 12.533-1.666 23.6-5 33.2-3.333 9.6-7.866 17.133-13.6 22.6-5.6 5.467-11.733 9.533-18.4 12.2-6.666 2.667-13.733 4-21.2 4zm0-31c9.067 0 15.6-3.733 19.6-11.2 4.134-7.6 6.2-17.533 6.2-29.8s-2.066-22.2-6.2-29.8c-4.133-7.6-10.666-11.4-19.6-11.4-8.933 0-15.466 3.8-19.6 11.4-4 7.6-6 17.533-6 29.8s2 22.2 6 29.8c4.134 7.467 10.667 11.2 19.6 11.2zM316.116 142c-2.134 0-3.2-1.067-3.2-3.2V118h-56c-2 0-3-1-3-3V92.8c0-1.333.4-2.733 1.2-4.2l56.6-84.6c.8-1.333 2.066-2 3.8-2h28c2 0 3 1 3 3v85.4h11.2c.933 0 1.733.333 2.4 1 .666.533 1 1.267 1 2.2v21.2c0 .933-.334 1.733-1 2.4-.667.533-1.467.8-2.4.8h-11.2v20.8c0 2.133-1.067 3.2-3.2 3.2h-27.2zm-29.6-51.6h26.4V51.2l-26.4 39.2z"
      />
    </svg>
  );
}

// Enhanced interactive particles
function EnhancedParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleCount = 40;
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      const size = Math.floor(Math.random() * 6) + 2;
      const left = Math.floor(Math.random() * 100);
      const top = Math.floor(Math.random() * 100);
      const animationDuration = Math.random() * 15 + 10;
      const delay = Math.random() * 5;
      const opacity = Math.random() * 0.3 + 0.1;

      newParticles.push({
        id: i,
        size,
        left,
        top,
        animationDuration,
        delay,
        opacity,
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: "absolute",
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle at 30% 30%, var(--primary), rgba(0,0,0,0))`,
            opacity: particle.opacity,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animation: `particle-float ${particle.animationDuration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            boxShadow: "0 0 10px rgba(var(--primary-rgb), 0.3)",
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}

// Enhanced grid background with subtle animation
function EnhancedGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 animate-pulse-slow"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: `
            linear-gradient(to right, rgba(var(--primary-rgb), 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.2) 1px, transparent 1px)
          `,
          zIndex: 0,
        }}
      />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundSize: "80px 80px",
          backgroundImage: `
            linear-gradient(to right, rgba(var(--primary-rgb), 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(var(--primary-rgb), 0.3) 1px, transparent 1px)
          `,
          zIndex: 0,
          animation: "grid-pulse 15s ease infinite",
        }}
      />
    </div>
  );
}

// Neon glitch effect for 404 text
function NeonGlitchText({ text = "404", className, ...props }) {
  return (
    <div className={cn("relative glitch-wrapper", className)} {...props}>
      <h1
        className="text-9xl md:text-10xl font-black text-primary tracking-tighter animate-glitch neon-text"
        data-text={text}
        aria-label={`${text} error`}
        style={{
          textShadow:
            "0 0 10px rgba(var(--primary-rgb), 0.8), 0 0 20px rgba(var(--primary-rgb), 0.4), 0 0 30px rgba(var(--primary-rgb), 0.2)",
        }}
      >
        {text}
      </h1>
    </div>
  );
}

// Digital Circuit Decoration
function DigitalCircuitDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 z-0">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="circuit"
            x="0"
            y="0"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M100,0 L100,50 M100,50 L150,50 M150,50 L150,100 M150,100 L200,100 M50,0 L50,150 M50,150 L0,150 M0,100 L100,100 M100,100 L100,200 M150,150 L200,150"
              stroke="var(--primary)"
              strokeWidth="1"
              fill="none"
            />
            <circle
              cx="50"
              cy="150"
              r="3"
              fill="var(--primary)"
              className="animate-pulse-slow"
            />
            <circle
              cx="100"
              cy="50"
              r="3"
              fill="var(--primary)"
              className="animate-pulse-slow"
            />
            <circle
              cx="150"
              cy="100"
              r="3"
              fill="var(--primary)"
              className="animate-pulse-slow"
            />
            <circle
              cx="100"
              cy="100"
              r="3"
              fill="var(--primary)"
              className="animate-pulse-slow"
            />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  );
}

// Enhanced NotFound component with interactive elements
function EnhancedNotFound({
  title = "Page not found",
  description = "Sorry, the page you are looking for doesn't exist or has been moved.",
  errorNumber = 404,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-center text-center z-10 pt-16 md:pt-20">
      <div className="relative inline-block mb-6">
        <NeonGlitchText text={errorNumber} />
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div
            className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse-slow"
            style={{ transform: "scale(1.5)" }}
          ></div>
        </div>
      </div>

      <h2 className="mt-6 text-balance text-2xl md:text-4xl font-semibold tracking-tight text-foreground sm:text-5xl animate-fade-in max-w-md backdrop-blur-sm">
        <span className="bg-clip-text text-gray-900/30 bg-gradient-to-r from-foreground to-foreground/70">
          {title}
        </span>
      </h2>

      {/* <p className="mt-6 text-pretty text-base md:text-lg font-normal text-muted-foreground max-w-md mx-auto animate-slide-up opacity-90 backdrop-blur-sm">
        {description}
      </p> */}

      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-y-4 gap-x-6 animate-bounce-in">
        <Button
          variant="outline"
          asChild
          className="group transition-all duration-300 transform hover:scale-105 border-primary/20 hover:border-primary/40 min-w-36 backdrop-blur-sm hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <a href="javascript:history.back()">
            <ArrowLeft
              className="me-2 ms-0 opacity-70 transition-transform group-hover:-translate-x-1"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Go back
          </a>
        </Button>

        <Button
          className="relative overflow-hidden -order-1 sm:order-none bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] min-w-36 group"
          asChild
        >
          <a href="/">
            <span className="relative z-10 flex items-center">
              <Home
                className="me-2 ms-0 opacity-90 transition-transform group-hover:rotate-12"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Take me home
            </span>
            <span className="absolute inset-0 w-full h-full bg-primary/20 animate-pulse-slow"></span>
            <span className="absolute -inset-full h-full w-1/3 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine"></span>
          </a>
        </Button>

        <Button
          variant="secondary"
          asChild
          className="relative overflow-hidden backdrop-blur-sm min-w-36 hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] group"
        >
          <a href={window.location.href}>
            <RefreshCw
              className="me-2 ms-0 opacity-70 transition-transform group-hover:rotate-180"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            Refresh page
            <span className="absolute -inset-full h-full w-1/3 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shine"></span>
          </a>
        </Button>
      </div>
    </div>
  );
}

// Main ErrorPage component with enhanced visuals and animations
function ErrorPage({
  title = "Page not found",
  description = "Sorry, the page you are looking for doesn't exist or has been moved.",
}) {
  return (
    <div className="relative flex flex-col w-full justify-center min-h-svh bg-background/95 backdrop-blur-sm p-4 md:p-8 overflow-hidden">
      <style jsx global>{`
        @keyframes floating {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(5px, 5px) rotate(0.5deg);
          }
          50% {
            transform: translate(0, 8px) rotate(0deg);
          }
          75% {
            transform: translate(-5px, 3px) rotate(-0.5deg);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          60% {
            opacity: 1;
            transform: scale(1.03);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes glitch {
          2%,
          64% {
            transform: translate(1px, 0) skew(0deg);
          }
          4%,
          60% {
            transform: translate(-1px, 0) skew(0deg);
          }
          62% {
            transform: translate(0, 0) skew(2deg);
          }
        }

        @keyframes glitch-anim {
          0% {
            clip: rect(28px, 9999px, 15px, 0);
          }
          5% {
            clip: rect(54px, 9999px, 120px, 0);
          }
          10% {
            clip: rect(53px, 9999px, 61px, 0);
          }
          15% {
            clip: rect(42px, 9999px, 73px, 0);
          }
          20% {
            clip: rect(86px, 9999px, 80px, 0);
          }
          25% {
            clip: rect(7px, 9999px, 92px, 0);
          }
          30% {
            clip: rect(35px, 9999px, 147px, 0);
          }
          35% {
            clip: rect(72px, 9999px, 4px, 0);
          }
          40% {
            clip: rect(25px, 9999px, 31px, 0);
          }
          45% {
            clip: rect(28px, 9999px, 141px, 0);
          }
          50% {
            clip: rect(54px, 9999px, 22px, 0);
          }
          55% {
            clip: rect(91px, 9999px, 135px, 0);
          }
          60% {
            clip: rect(9px, 9999px, 48px, 0);
          }
          65% {
            clip: rect(6px, 9999px, 11px, 0);
          }
          70% {
            clip: rect(93px, 9999px, 48px, 0);
          }
          75% {
            clip: rect(79px, 9999px, 71px, 0);
          }
          80% {
            clip: rect(46px, 9999px, 21px, 0);
          }
          85% {
            clip: rect(76px, 9999px, 69px, 0);
          }
          90% {
            clip: rect(38px, 9999px, 140px, 0);
          }
          95% {
            clip: rect(82px, 9999px, 61px, 0);
          }
          100% {
            clip: rect(17px, 9999px, 131px, 0);
          }
        }

        @keyframes glitch-anim2 {
          0% {
            clip: rect(129px, 9999px, 36px, 0);
          }
          5% {
            clip: rect(36px, 9999px, 4px, 0);
          }
          10% {
            clip: rect(85px, 9999px, 66px, 0);
          }
          15% {
            clip: rect(91px, 9999px, 91px, 0);
          }
          20% {
            clip: rect(148px, 9999px, 138px, 0);
          }
          25% {
            clip: rect(38px, 9999px, 122px, 0);
          }
          30% {
            clip: rect(69px, 9999px, 54px, 0);
          }
          35% {
            clip: rect(98px, 9999px, 71px, 0);
          }
          40% {
            clip: rect(146px, 9999px, 34px, 0);
          }
          45% {
            clip: rect(134px, 9999px, 43px, 0);
          }
          50% {
            clip: rect(102px, 9999px, 80px, 0);
          }
          55% {
            clip: rect(119px, 9999px, 44px, 0);
          }
          60% {
            clip: rect(106px, 9999px, 99px, 0);
          }
          65% {
            clip: rect(141px, 9999px, 74px, 0);
          }
          70% {
            clip: rect(20px, 9999px, 78px, 0);
          }
          75% {
            clip: rect(133px, 9999px, 79px, 0);
          }
          80% {
            clip: rect(78px, 9999px, 52px, 0);
          }
          85% {
            clip: rect(35px, 9999px, 39px, 0);
          }
          90% {
            clip: rect(67px, 9999px, 70px, 0);
          }
          95% {
            clip: rect(71px, 9999px, 103px, 0);
          }
          100% {
            clip: rect(83px, 9999px, 40px, 0);
          }
        }

        @keyframes particle-float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.5;
          }
          40% {
            opacity: 0.7;
          }
          60% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100px) translateX(20px);
            opacity: 0;
          }
        }

        @keyframes morph {
          0% {
            border-radius: 40% 60% 60% 40% / 60% 30% 70% 40%;
          }
          100% {
            border-radius: 40% 60%;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes rotate-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes rotate-reverse {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(-360deg);
          }
        }

        @keyframes grid-pulse {
          0%,
          100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.1;
          }
        }

        @keyframes shine {
          from {
            left: -100%;
            opacity: 0;
          }
          20% {
            opacity: 0.3;
          }
          to {
            left: 100%;
            opacity: 0;
          }
        }

        @keyframes glow {
          0%,
          100% {
            text-shadow: 0 0 15px rgba(var(--primary-rgb), 0.8);
          }
          50% {
            text-shadow: 0 0 30px rgba(var(--primary-rgb), 0.6),
              0 0 60px rgba(var(--primary-rgb), 0.4);
          }
        }

        .animate-floating {
          animation: floating 10s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out 0.3s forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        .animate-bounce-in {
          animation: bounce-in 1s cubic-bezier(0.19, 1, 0.22, 1) 0.6s forwards;
          opacity: 0;
          transform: scale(0.9);
        }
        .animate-glitch {
          animation: glitch 2.5s infinite;
        }
        .animate-particle-float {
          animation: particle-float 15s linear infinite;
        }
        .animate-morph {
          animation: morph 10s ease-in-out infinite alternate;
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite alternate;
        }
        .animate-rotate-slow {
          animation: rotate-slow 60s linear infinite;
        }
        .animate-rotate-reverse {
          animation: rotate-reverse 45s linear infinite;
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }

        .glitch-wrapper {
          position: relative;
          display: inline-block;
        }
        .glitch-text {
          position: relative;
        }
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
        }
        .glitch-text::before {
          left: 2px;
          clip: rect(44px, 450px, 56px, 0);
          text-shadow: -2px 0 #ff00c1;
          animation: glitch-anim 5s infinite linear alternate-reverse;
        }
        .glitch-text::after {
          left: -2px;
          clip: rect(44px, 450px, 56px, 0);
          text-shadow: 2px 0 #00fff9;
          animation: glitch-anim2 5s infinite linear alternate-reverse;
        }

        .neon-text {
          animation: glow 3s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.5));
        }
      `}</style>

      {/* Root container with absolute positioned elements */}
      <div className="relative max-w-4xl mx-auto w-full h-full min-h-[600px]">
        {/* Enhanced Background Elements */}
        <EnhancedGridBackground />
        <DigitalCircuitDecoration />
        <EnhancedParticles />

        {/* Decorative elements with improved positioning and animations */}
        <Abstract3DShape
          style={{
            top: "-140px",
            left: "-120px",
            transform: "rotate(15deg) scale(0.85)",
            zIndex: 1,
          }}
        />
        <Abstract3DShape
          style={{
            bottom: "-170px",
            right: "-140px",
            transform: "rotate(-18deg) scale(0.9)",
            zIndex: 1,
          }}
        />
        <GeometricDecoration
          style={{
            top: "-70px",
            right: "-60px",
            transform: "rotate(30deg) scale(0.85)",
            zIndex: 1,
          }}
        />
        <GeometricDecoration
          style={{
            bottom: "-50px",
            left: "-80px",
            transform: "rotate(-20deg) scale(0.65)",
            zIndex: 1,
          }}
        />

        {/* Enhanced 404 Illustration with better placement and effects */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <Illustration
            style={{
              width: "90%",
              maxWidth: "800px",
              height: "auto",
              opacity: 0.06,
              color: "var(--foreground)",
              filter: "blur(2px)",
            }}
          />
        </div>

        {/* Improved content container with better spacing */}
        <div className="relative flex flex-col items-center justify-center h-full z-10 py-20">
          <EnhancedNotFound title={title} description={description} />
        </div>

        {/* Subtle interactive gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-background/30 pointer-events-none"></div>
      </div>
    </div>
  );
}

export { ErrorPage, EnhancedNotFound, Illustration, Button, buttonVariants };
