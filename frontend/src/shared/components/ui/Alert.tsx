import type { ReactNode } from "react";

interface AlertProps {
  variant?: "info" | "warning" | "error" | "success";
  children: ReactNode;
  icon?: ReactNode;
}

export function Alert({ variant = "info", children, icon }: AlertProps) {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
    error: "bg-red-50 border-red-200 text-red-900",
    success: "bg-green-50 border-green-200 text-green-900",
  };

  const iconColors = {
    info: "text-blue-600",
    warning: "text-yellow-600",
    error: "text-red-600",
    success: "text-green-600",
  };

  return (
    <div className={`p-4 border rounded-lg flex gap-3 ${variants[variant]}`}>
      {icon && (
        <div className={`flex-shrink-0 mt-0.5 ${iconColors[variant]}`}>
          {icon}
        </div>
      )}
      <div className="text-sm flex-1">{children}</div>
    </div>
  );
}
