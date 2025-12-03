import React, { useState } from 'react';
import { Download, Search, Filter } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  onRowDoubleClick?: (item: T) => void;
  title: string;
}

export const DataTable = <T extends { id: string | number }>({ data, columns, onRowClick, onRowDoubleClick, title }: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Simple generic search
  const filteredData = data.filter(item => 
    Object.values(item as any).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleExportCSV = () => {
    const headers = columns.map(c => c.header).join(',');
    const rows = filteredData.map(item => 
      columns.map(c => {
         // rudimentary value extraction
         const val = (item as any)[c.key];
         return typeof val === 'object' ? 'Object' : val;
      }).join(',')
    ).join('\n');
    
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s/g, '_')}_export.csv`;
    a.click();
  };

  const isInteractive = !!(onRowClick || onRowDoubleClick);

  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-slate-200 rounded-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 px-2">{title} <span className="text-slate-400 font-normal">({filteredData.length})</span></h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-8 pr-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-indigo-500 w-48 bg-white text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Filtrer">
            <Filter className="w-4 h-4" />
          </button>
          <button onClick={handleExportCSV} className="p-1 hover:bg-slate-200 rounded text-slate-600" title="Exporter CSV">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="p-2 text-xs font-bold text-slate-600 uppercase border-b border-r border-slate-200 last:border-r-0 tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredData.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onRowClick && onRowClick(item)}
                onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(item)}
                className={`hover:bg-indigo-50 border-b border-slate-100 last:border-0 even:bg-slate-50/50 ${isInteractive ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className="p-2 text-slate-700 border-r border-slate-100 last:border-r-0 truncate max-w-xs">
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400">
                  Aucun enregistrement trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};