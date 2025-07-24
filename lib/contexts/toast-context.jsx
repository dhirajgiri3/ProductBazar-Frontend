"use client";

import { createContext, useContext } from "react";
import toast from "react-hot-toast";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  MessageCircle,
  Lock,
  Shield,
  Info
} from "lucide-react";

// Create a context for toast functionality
const ToastContext = createContext();

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  // Function to show toast messages with different types
  const showToast = (...args) => {
    /*
      Flexible signature handler.
      We support both of these call patterns to avoid widespread refactors:
        1. showToast(type, message, icon?, duration?)  <-- preferred (type first)
        2. showToast(message, type, icon?, duration?)  <-- legacy (message first)

      Additional optional params:
        icon     – ReactNode (or string) passed directly to toast 🎨
        duration – number (ms) – overrides default duration ⏲️
    */

    let type, message, icon, duration;

    if (typeof args[0] === "string" && ["success", "error", "warning", "info", "loading", "custom"].includes(args[0])) {
      // New signature: (type, msg, ...)
      [type, message, icon, duration] = args;
    } else {
      // Legacy signature: (msg, type, ...)
      [message, type = "custom", icon, duration] = args;
    }

    // Normalise unsupported type aliases
    if (type === "info") type = "custom"; // treat 'info' as custom for now

    // Base dark theme styling
    const baseStyle = {
      background: "#1a1a1a",
      color: "#ffffff",
      border: "1px solid #333333",
      borderRadius: "12px",
      padding: "16px 20px",
      fontSize: "14px",
      fontWeight: "500",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      backdropFilter: "blur(10px)",
      maxWidth: "400px",
      minWidth: "300px",
    };

    const commonOptions = {
      position: "top-center",
      duration: duration || (type === "error" ? 4000 : 3000),
      icon,
      style: baseStyle,
    };

    switch (type) {
      case "success":
        toast.success(message, {
          ...commonOptions,
          style: {
            ...baseStyle,
            background: "#0f1a0f",
            border: "1px solid #22c55e",
            color: "#4ade80",
          },
          icon: icon || <CheckCircle size={20} className="text-green-400" />,
        });
        break;
      case "error":
        toast.error(message, {
          ...commonOptions,
          style: {
            ...baseStyle,
            background: "#1a0f0f",
            border: "1px solid #ef4444",
            color: "#f87171",
          },
          icon: icon || <XCircle size={20} className="text-red-400" />,
        });
        break;
      case "warning":
        toast(message, {
          ...commonOptions,
          style: {
            ...baseStyle,
            background: "#1a150f",
            border: "1px solid #f59e0b",
            color: "#fbbf24",
          },
          icon: icon || <AlertTriangle size={20} className="text-amber-400" />,
        });
        break;
      case "loading":
        return toast.loading(message, {
          ...commonOptions,
          style: {
            ...baseStyle,
            background: "#0f1a1a",
            border: "1px solid #06b6d4",
            color: "#22d3ee",
          },
          icon: icon || <Loader2 size={20} className="text-cyan-400 animate-spin" />,
        });
      case "custom":
      default:
        toast(message, {
          ...commonOptions,
          style: {
            ...baseStyle,
            background: "#0f0f1a",
            border: "1px solid #6366f1",
            color: "#a5b4fc",
          },
          icon: icon || <MessageCircle size={20} className="text-indigo-400" />,
        });
    }
  };

  // Dismiss a specific toast by ID
  const dismissToast = (id) => {
    toast.dismiss(id);
  };

  // Values to be provided by the context
  const value = {
    showToast,
    dismissToast,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export default ToastContext;