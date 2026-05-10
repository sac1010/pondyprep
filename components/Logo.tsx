interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
}

const config = {
  sm: { box: 'w-5 h-5 rounded text-xs', text: 'text-sm' },
  md: { box: 'w-7 h-7 rounded-lg text-sm', text: 'text-xl' },
  lg: { box: 'w-8 h-8 rounded-xl text-base', text: 'text-2xl' },
}

export default function Logo({ size = 'md' }: LogoProps) {
  const c = config[size]
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`${c.box} bg-blue-600 text-white font-black flex items-center justify-center shrink-0 select-none`}>
        P
      </span>
      <span className={`${c.text} font-bold tracking-tight`}>
        <span className="text-slate-900">Pondy</span><span className="text-blue-600">Prep</span>
      </span>
    </span>
  )
}
