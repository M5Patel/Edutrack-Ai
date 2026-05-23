import { getInitials } from '../../utils/helpers'

const Avatar = ({ name, src, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }
  if (src) return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover ${className}`} />
  return (
    <div className={`${sizes[size]} rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold ${className}`}>
      {getInitials(name)}
    </div>
  )
}
export default Avatar
