import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export default function Table<T>({ columns, data, emptyMessage = "Nenhum registro encontrado." }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#dfe6f1] border-t-[#1b4693] bg-white shadow-[0_2px_5px_rgba(16,45,93,0.08)]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#e8edf5] bg-[#f8fafd]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#5e7495] ${
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                      ? "text-center"
                      : "text-left"
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={idx} className="border-b border-[#edf1f7] last:border-0 odd:bg-white even:bg-[#fbfcfe] hover:bg-[#f3f7fd]">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-gray-700 ${
                      col.align === "right"
                        ? "text-right tabular-nums"
                        : col.align === "center"
                          ? "text-center"
                          : "text-left"
                    }`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}