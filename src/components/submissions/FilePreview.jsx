import { Download } from 'lucide-react'
import { getFileIcon } from '../../utils/helpers'

const FilePreview = ({ file }) => {
  const isImage = file.fileType?.includes('image')
  const isPDF = file.fileType?.includes('pdf')
  const isCode = ['javascript', 'python', 'html', 'css', 'text/plain'].some(t => file.fileType?.includes(t))

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden">
      {isPDF ? (
        <iframe src={file.url} className="w-full h-96" title={file.fileName} />
      ) : isImage ? (
        <img src={file.url} alt={file.fileName} className="w-full max-h-96 object-contain bg-surface-3" />
      ) : (
        <div className="flex items-center gap-4 p-6 bg-surface-3">
          <span className="text-3xl">{getFileIcon(file.fileType)}</span>
          <div className="flex-1">
            <p className="font-medium text-[var(--text-primary)]">{file.fileName}</p>
            <p className="text-sm text-[var(--text-muted)]">{file.fileType}</p>
          </div>
          <a href={file.url} target="_blank" rel="noreferrer" className="btn-primary flex items-center gap-2 text-sm">
            <Download size={16} /> Download
          </a>
        </div>
      )}
    </div>
  )
}
export default FilePreview
