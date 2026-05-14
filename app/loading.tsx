import Logo from '@/components/Logo'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <Logo />
        <div className="mt-8 flex gap-2">
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400 tracking-wide uppercase">Loading</p>
      </div>
    </div>
  )
}
