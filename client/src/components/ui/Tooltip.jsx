import { useState } from 'react'

const Tooltip = ({ children, content, position = 'top' }) => {
  const [show, setShow] = useState(false)
  const pos = { top: 'bottom-full left-1/2 -translate-x-1/2 mb-2', bottom: 'top-full left-1/2 -translate-x-1/2 mt-2', left: 'right-full top-1/2 -translate-y-1/2 mr-2', right: 'left-full top-1/2 -translate-y-1/2 ml-2' }

  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={`absolute z-50 ${pos[position]} px-3 py-1.5 bg-surface-3 border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] whitespace-nowrap shadow-lg animate-fade-in`}>
          {content}
        </div>
      )}
    </div>
  )
}
export default Tooltip
