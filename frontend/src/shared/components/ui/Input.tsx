"use client";

import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none ${
            leftIcon ? "pl-10" : ""
          } ${rightIcon ? "pr-10" : ""} ${
            error ? "border-red-500" : ""
          } ${className}`}
          style={
            !error
              ? {
                  borderColor: undefined,
                }
              : undefined
          }
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "var(--brand-primary)";
              e.currentTarget.style.boxShadow = `0 0 0 3px rgba(${getComputedStyle(
                document.documentElement
              )
                .getPropertyValue("--brand-primary")
                .trim()}, 0.1)`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.boxShadow = "";
          }}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
