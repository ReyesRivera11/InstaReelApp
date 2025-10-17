import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && <label htmlFor={props.id}>{label}</label>}
      <textarea
        className={`w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
