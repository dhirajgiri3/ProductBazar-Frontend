import { useRef } from "react";
import { Balloons } from "./balloons";

export function DefaultBalloonsDemo() {
  const balloonsRef = useRef(null);

  const handleLaunch = () => {
    if (balloonsRef.current) {
      balloonsRef.current.launchAnimation();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">      
      <button 
        onClick={handleLaunch}
        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md transition-colors"
      >
        Launch Balloons! 🎈
      </button>

      <Balloons 
        ref={balloonsRef}
        type="default"
      />
    </div>
  );
}

export function TextBalloonsDemo() {
  const balloonsRef = useRef(null);

  const handleLaunch = () => {
    if (balloonsRef.current) {
      balloonsRef.current.launchAnimation();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">      
      <button 
        onClick={handleLaunch}
        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md transition-colors"
      >
        Launch Text Balloons! 🎈
      </button>

      <Balloons 
        ref={balloonsRef}
        type="text"
        text="🚀 Product Added!"
        fontSize={80}
        color="#8B5CF6"
      />
    </div>
  );
}