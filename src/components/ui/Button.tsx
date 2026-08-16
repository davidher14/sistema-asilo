import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const variantClasses = {
  primary:
    "bg-[#1B2A83] text-white hover:bg-[#16205f] focus:ring-[#00B4F0]/40 shadow-sm",
  secondary:
    "bg-white text-[#1B2A83] border border-[#1B2A83]/20 hover:bg-[#1B2A83]/5 focus:ring-[#00B4F0]/30",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400/30",
  danger:
    "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/40 shadow-sm",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed btn-scale ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}