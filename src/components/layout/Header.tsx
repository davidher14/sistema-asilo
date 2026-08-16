import { initials } from "../../utils/helpers";

interface HeaderProps {
  title: string;
  subtitle: string;
  alertCount?: number;
}

export default function Header({ title, subtitle, alertCount = 0 }: HeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-full bg-alert-100 px-3.5 py-1.5 text-sm font-semibold text-alert-500 transition-colors hover:bg-alert-100/80"
          title="Alertas de estoque"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          {alertCount} alertas
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white">
          {initials("Maria Fernanda Silva")}
        </div>
      </div>
    </header>
  );
}