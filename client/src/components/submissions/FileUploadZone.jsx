import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File } from 'lucide-react'
import { formatFileSize, getFileIcon } from '../../utils/helpers'

const FileUploadZone = ({ files, setFiles, maxFiles = 5 }) => {
  const onDrop = useCallback((accepted) => {
    const remaining = maxFiles - files.length
    setFiles(prev => [...prev, ...accepted.slice(0, remaining)])
  }, [files, maxFiles, setFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles, maxSize: 50 * 1024 * 1024 })

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${isDragActive ? 'border-primary bg-primary/5' : 'border-[var(--border)] hover:border-primary/50'}`}>
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto mb-3 text-[var(--text-muted)]" />
        <p className="text-sm text-[var(--text-secondary)]">{isDragActive ? 'Drop files here...' : 'Drag & drop files, or click to browse'}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">PDF, Images, Code, Video, ZIP — max 50MB × {maxFiles} files</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-surface-3 rounded-xl">
              <span className="text-lg">{getFileIcon(file.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={() => removeFile(i)} className="p-1 hover:bg-surface-2 rounded-lg transition-colors">
                <X size={16} className="text-[var(--text-muted)]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default FileUploadZone
