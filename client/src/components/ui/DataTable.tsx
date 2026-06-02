import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
}

export default function DataTable<T>({ columns, data }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-800">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className={`text-left px-4 py-3 font-medium ${h.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300' : ''}`}
                  onClick={h.column.getToggleSortingHandler()}
                  aria-sort={h.column.getIsSorted() === 'asc' ? 'ascending' : h.column.getIsSorted() === 'desc' ? 'descending' : 'none'}
                >
                  <div className="flex items-center gap-1.5">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getCanSort() && (
                      <span className="text-gray-300 dark:text-gray-600">
                        {h.column.getIsSorted() === 'asc' ? <FiChevronUp size={14} /> :
                         h.column.getIsSorted() === 'desc' ? <FiChevronDown size={14} /> :
                         <span className="flex flex-col -gap-1"><FiChevronUp size={10} /><FiChevronDown size={10} className="-mt-1.5" /></span>}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-gray-700 dark:text-gray-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
