// src/components/BorderBeam.jsx

import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { twMerge } from "tailwind-merge";
import styles from "./BorderBeam.module.css";

export const BorderBeam = ({ className, delay = 0 }) => {
  const meteorRef = useRef(null);

  useEffect(() => {
    const meteor = meteorRef.current;
    if (!meteor) return;

    const handleAnimationEnd = () => {
      // Hide the beam and set new random properties for the next cycle
      meteor.style.visibility = "hidden";
      const newDelay = Math.random() * 3 + 1; // 1s to 4s
      const newDuration = Math.random() * 3 + 2; // 2s to 5s
      const newWidth = Math.floor(Math.random() * (120 - 40) + 40); // 40px to 120px

      meteor.style.setProperty("--meteor-delay", `${newDelay}s`);
      meteor.style.setProperty("--meteor-duration", `${newDuration}s`);
      meteor.style.setProperty("--meteor-width", `${newWidth}px`);

      // A trick to restart a CSS animation
      meteor.style.animation = "none";
      void meteor.offsetWidth; // Trigger reflow
      meteor.style.animation = "";
    };

    const handleAnimationStart = () => {
      meteor.style.visibility = "visible";
    };

    meteor.addEventListener("animationend", handleAnimationEnd);
    meteor.addEventListener("animationstart", handleAnimationStart);

    // Cleanup event listeners on component unmount
    return () => {
      meteor.removeEventListener("animationend", handleAnimationEnd);
      meteor.removeEventListener("animationstart", handleAnimationStart);
    };
  }, []);

  return (
    <span
      ref={meteorRef}
      // The initial delay is passed as an inline style
      style={{ animationDelay: `${delay}s` }}
      className={twMerge(
        // Base styles for the beam
        "absolute top-0 z-50 h-[1px] w-[1px] rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[180deg]",
        // The CSS module class that applies the animation
        styles.meteor,
        // Any additional classes passed via props
        className
      )}
    ></span>
  );
};

// Define prop types for the component
BorderBeam.propTypes = {
  className: PropTypes.string,
  delay: PropTypes.number,
};