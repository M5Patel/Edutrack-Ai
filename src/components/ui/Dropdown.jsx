import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger || <button className="p-2 rounded-xl hover:bg-surface-3"><ChevronDown size={16} /></button>}</div>
      {open && (
        <div className={`absolute z-50 mt-2 ${align === 'right' ? 'right-0' : 'left-0'} min-w-[200px] bg-surface-2 border border-[var(--border)] rounded-xl shadow-xl py-1 animate-fade-in`} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  )
}
export const DropdownItem = ({ children, onClick, danger, className = '' }) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-3 transition-colors ${danger ? 'text-red-500' : 'text-[var(--text-primary)]'} ${className}`}>
    {children}
  </button>
)
export default Dropdown
