interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchInput({
  placeholder = "Buscar...",
  value,
  onChange,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[#d7e0ed] bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 placeholder-[#91a4bf] shadow-sm transition-colors focus:border-[#24509a] focus:outline-none focus:ring-2 focus:ring-[#24509a]/20"
      />
    </div>
  );
}