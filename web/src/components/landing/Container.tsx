export default function Container({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`max-w-[1280px] mx-auto w-full px-16 ${className}`}>
      {children}
    </div>
  )
}
