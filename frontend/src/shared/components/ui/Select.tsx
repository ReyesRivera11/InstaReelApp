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
      {label && <label htmlFor={props.id}>{label}</label>}
      <select
        className={`w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
