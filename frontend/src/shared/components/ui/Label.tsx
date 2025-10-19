import React from "react";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  size?: "sm" | "md" | "lg";
  muted?: boolean;
  requiredMark?: boolean;
  align?: "left" | "right";
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      children,
      size = "sm",
      muted = false,
      requiredMark = false,
      align = "left",
      className = "",
      ...props
    },
    ref
  ) => {
    let sizeClass = "text-sm";
    if (size === "md") sizeClass = "text-base";
    if (size === "lg") sizeClass = "text-lg";

    const colorClass = muted ? "text-gray-500" : "text-gray-900";
    const alignClass = align === "right" ? "justify-end" : "justify-start";

    const baseClass =
      "inline-flex items-center gap-1 font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

    return (
      <label
        ref={ref}
        className={`${baseClass} ${sizeClass} ${colorClass} ${alignClass} ${className}`}
        {...props}
      >
        {children}
        {requiredMark && <span className="text-red-500">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";
