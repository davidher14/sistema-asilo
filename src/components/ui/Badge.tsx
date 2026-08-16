import type { ReactNode } from "react";

type BadgeVariant = "green" | "blue" | "purple" | "red" | "orange" | "gray";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green: "bg-emerald-100 text-emerald-800",
  blue: "bg-blue-100 text-blue-800",
  purple: "bg-purple-100 text-purple-800",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-800",
  gray: "bg-gray-200 text-gray-700",
};

export default function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}