import type { ReactNode } from 'react'

interface KPICardProps {
  label: string
  value: string
  sub?: string
  icon: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  accent?: string
}

export function KPICard({ label, value, sub, icon, trend, trendLabel, accent = '#4F8EF7' }: KPICardProps) {
  const trendColor = trend === 'up' ? 'text-[#34D399]' : trend === 'down' ? 'text-red-400' : 'text-gray-500'
  const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
      </div>
      <div>
        <div className="num text-2xl font-semibold text-white leading-none">{value}</div>
        {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
      </div>
      {trendLabel && (
        <div className={`text-xs ${trendColor} flex items-center gap-1`}>
          {trendSymbol && <span>{trendSymbol}</span>}
          {trendLabel}
        </div>
      )}
    </div>
  )
}
