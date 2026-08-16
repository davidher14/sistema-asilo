import type { ReactNode } from "react";

type StatColor = "red" | "green" | "purple" | "blue" | "orange";

interface StatCardProps {
  label: string;
  value: ReactNode;
  color?: StatColor;
  icon?: ReactNode;
  hint?: string;
}

const colorClasses: Record<StatColor, { value: string; icon: string }> = {
  red: { value: "text-red-600", icon: "bg-red-100 text-red-600" },
  green: { value: "text-emerald-600", icon: "bg-emerald-100 text-emerald-600" },
  purple: { value: "text-purple-600", icon: "bg-purple-100 text-purple-600" },
  blue: { value: "text-blue-600", icon: "bg-blue-100 text-blue-600" },
  orange: { value: "text-orange-600", icon: "bg-orange-100 text-orange-600" },
};

export default function StatCard({ label, value, color = "blue", icon, hint }: StatCardProps) {
  const { value: valueClass, icon: iconClass } = colorClasses[color];
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${valueClass}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
      {icon && (
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>{icon}</div>
      )}
    </div>
  );
}