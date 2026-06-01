'use client'

import { useId } from 'react'

type Props = {
  size?: number
  color?: string
}

export default function PoroMark({ size = 120, color = 'var(--purple-700)' }: Props) {
  const uid = useId()
  const maskId = `poro-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <mask id={maskId}>
          <rect width="100" height="100" fill="#fff" />
          {/* 'P' carved into the body as negative space */}
          <path
            d="M42 44 V70 M42 44 H54 a7 7 0 0 1 0 14 H42"
            stroke="#000"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        {/* Two soft tufted horns */}
        <path d="M34 24 Q30 12 38 14 Q42 20 40 30 Q37 32 34 30 Z" fill={color} />
        <path d="M66 24 Q70 12 62 14 Q58 20 60 30 Q63 32 66 30 Z" fill={color} />
        {/* Cloud-like body */}
        <path d="M20 58 Q20 32 50 30 Q80 32 80 58 Q80 82 50 82 Q20 82 20 58 Z" fill={color} />
      </g>
    </svg>
  )
}
