"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useEffect, useState } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "destructive"
    | "ghost"
    | "brand"
    | "gradient";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const [network, setNetwork] = useState<string>("instagram");

  useEffect(() => {
    const updateNetwork = () => {
      const currentNetwork =
        document.documentElement.getAttribute("data-network") || "instagram";
      setNetwork(currentNetwork);
    };

    updateNetwork();

    const observer = new MutationObserver(updateNetwork);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-network"],
    });

    return () => observer.disconnect();
  }, []);

  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] font-medium";

  const getGradientClass = () => {
    switch (network) {
      case "facebook":
        return "bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30";
      case "tiktok":
        return "bg-gradient-to-br from-black to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg shadow-gray-500/30";
      case "whatsapp":
        return "bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-500/30";
      case "x":
        return "bg-gradient-to-br from-black to-gray-900 hover:from-gray-900 hover:to-black text-white shadow-lg shadow-gray-500/30";
      case "instagram":
      default:
        return "bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30";
    }
  };

  const variants = {
    primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm",
    secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
    outline: "border border-border hover:bg-accent text-foreground",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    ghost: "hover:bg-accent text-foreground",
    brand: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
    gradient: getGradientClass(), 
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} hover:cursor-pointer`}
      {...props}
    >
      {children}
    </button>
  );
}
