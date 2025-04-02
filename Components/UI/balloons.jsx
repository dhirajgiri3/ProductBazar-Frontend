import * as React from "react";
import { cn } from "../../lib/utils";

const Balloons = React.forwardRef(
  ({ type = "default", text, fontSize = 120, color = "#000000", className, onLaunch }, ref) => {
    const containerRef = React.useRef(null);
    
    const launchAnimation = React.useCallback(() => {
      if (type === "default") {
        import("balloons-js").then(({ balloons }) => {
          balloons();
        });
      } else if (type === "text" && text) {
        import("balloons-js").then(({ textBalloons }) => {
          textBalloons([
            {
              text,
              fontSize,
              color,
            },
          ]);
        });
      }
      
      if (onLaunch) {
        onLaunch();
      }
    }, [type, text, fontSize, color, onLaunch]);

    // Export the animation launch method
    React.useImperativeHandle(ref, () => ({
      launchAnimation,
      ...(containerRef.current || {})
    }), [launchAnimation]);

    return <div ref={containerRef} className={cn("balloons-container", className)} />;
  }
);

Balloons.displayName = "Balloons";

export { Balloons };