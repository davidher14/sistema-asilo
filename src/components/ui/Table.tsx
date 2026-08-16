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
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${
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
              <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60">
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