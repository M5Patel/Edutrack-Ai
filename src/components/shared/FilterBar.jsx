const FilterBar = ({ filters, activeFilter, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {filters.map(f => (
      <button
        key={f.value}
        onClick={() => onChange(f.value)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
          activeFilter === f.value
            ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
            : 'bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:border-primary/40 hover:text-primary hover:bg-primary/5'
        }`}
      >
        {f.label}
      </button>
    ))}
  </div>
)
export default FilterBar
