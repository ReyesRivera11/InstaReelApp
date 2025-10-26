"use client";

import type { SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: SelectProps) {
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
      <select
        className={`w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-foreground transition-all duration-200 focus:outline-none ${
          error ? "border-red-500" : ""
        } ${className}`}
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
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
