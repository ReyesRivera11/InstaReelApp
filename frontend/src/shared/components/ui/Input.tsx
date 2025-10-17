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
      {label && <label htmlFor={props.id}>{label}</label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={`w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            leftIcon ? "pl-10" : ""
          } ${rightIcon ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
