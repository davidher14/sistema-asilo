interface HeaderProps {
  title: string;
  subtitle: string;
  alertCount?: number;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex min-h-[90px] items-center justify-between gap-4 border-b border-[#d9e1ef] bg-white px-7 py-5 shadow-sm lg:px-8">
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-[#102d5b]">{title}</h1>
        <p className="mt-0.5 text-sm text-[#6f829f]">{subtitle}</p>
      </div>
    </header>
  );
}