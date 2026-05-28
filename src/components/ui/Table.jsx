const Table = ({ columns, data, onRowClick, emptyMessage = 'No data found' }) => (
  <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
    <table className="w-full">
      <thead>
        <tr className="bg-surface-3">
          {columns.map((col, i) => (
            <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--border)]">
        {data.length === 0 ? (
          <tr><td colSpan={columns.length} className="text-center py-12 text-[var(--text-muted)]">{emptyMessage}</td></tr>
        ) : (
          data.map((row, i) => (
            <tr key={i} onClick={() => onRowClick?.(row)} className={`bg-surface-2 hover:bg-surface-3 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
              {columns.map((col, j) => (
                <td key={j} className="px-4 py-3 text-sm text-[var(--text-primary)]">{col.render ? col.render(row) : row[col.accessor]}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)
export default Table
