type Props = {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
  style?: React.CSSProperties
}

const PATHS: Record<string, React.ReactNode> = {
  'refresh-cw':      <><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M3 21v-5h5"/></>,
  'shield':          <><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/></>,
  'monitor':         <><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></>,
  'search':          <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  'arrow-right':     <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  'arrow-left':      <><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></>,
  'chevron-down':    <><path d="m6 9 6 6 6-6"/></>,
  'chevron-right':   <><path d="m9 6 6 6-6 6"/></>,
  'clock':           <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  'users':           <><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><circle cx="17" cy="6" r="3"/><path d="M22 18a5 5 0 0 0-5-5"/></>,
  'calendar':        <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></>,
  'rocket':          <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></>,
  'award':           <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></>,
  'mail':            <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  'check-circle':    <><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5L16 9"/></>,
  'x':               <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
  'lock':            <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></>,
  'eye':             <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  'eye-off':         <><path d="M3 3l18 18"/><path d="M10.6 6.1A10.4 10.4 0 0 1 12 6c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4"/><path d="M6.5 6.5C3.5 8.5 2 12 2 12s3.5 7 10 7c1.6 0 3-.3 4.3-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
  'alert':           <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5"/><path d="M12 18v.5"/></>,
  'check':           <><path d="m5 12 5 5 9-12"/></>,
  'send':            <><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></>,
  'arrow-up-right':  <><path d="M7 17 17 7"/><path d="M7 7h10v10"/></>,
  'home':            <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></>,
  'inbox':           <><path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 5h14l2 8v6H3v-6l2-8Z"/></>,
  'book':            <><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5Z"/><path d="M4 5v13a2 2 0 0 1 2-2h13"/></>,
  'bell':            <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  'plus':            <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  'key':             <><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9"/><path d="m17 6 3 3"/><path d="m14 9 3 3"/></>,
}

export default function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.75, style }: Props) {
  const paths = PATHS[name]
  if (!paths) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, ...style }}
    >
      {paths}
    </svg>
  )
}
