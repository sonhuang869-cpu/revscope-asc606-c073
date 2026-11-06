import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, FileText, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { getContracts, getAuditLog } from '../lib/api'
import { getPortfolioKPIs, getPOTypeBreakdown, getRecognitionSchedule } from '../lib/calculations'
import { KPICard } from '../components/KPICard'
import { StatusBadge } from '../components/StatusBadge'
import type { Contract, AuditEntry } from '../types'
import { format, parseISO } from 'date-fns'

const PIE_COLORS = ['#4F8EF7', '#34D399', '#F59E0B', '#a78bfa', '#f87171']

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function fmtFull(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

export function Dashboard() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getContracts(), getAuditLog()]).then(([c, a]) => {
      setContracts(c)
      setAudit(a)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-sm">Loading portfolio data…</div>
      </div>
    )
  }

  const kpis = getPortfolioKPIs(contracts)
  const breakdown = getPOTypeBreakdown(contracts)
  const attention = contracts.filter(c =>
    c.status === 'Modified' || c.status === 'Draft' ||
    c.performanceObligations.some(po => po.variableConsideration)
  )

  // Build 12-month waterfall from all active contracts
  const months: Record<string, { recognized: number; deferred: number }> = {}
  for (const c of contracts) {
    if (c.status === 'Terminated') continue
    const schedule = getRecognitionSchedule(c)
    for (const entry of schedule.slice(0, 12)) {
      if (!months[entry.month]) months[entry.month] = { recognized: 0, deferred: 0 }
      months[entry.month].recognized += entry.recognized
      months[entry.month].deferred += entry.deferred
    }
  }
  const waterfallData = Object.entries(months).slice(0, 12).map(([month, v]) => ({
    month: month.split(' ')[0],
    recognized: Math.round(v.recognized),
    deferred: Math.round(v.deferred),
  }))

  const topContracts = [...contracts]
    .sort((a, b) => b.tcv - a.tcv)
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Portfolio Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), 'MMMM d, yyyy')} · ASC 606 Revenue Recognition
          </p>
        </div>
        <Link to="/contracts/new" className="btn-primary flex items-center gap-2">
          <FileText size={14} />
          New Contract
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total ARR"
          value={fmt(kpis.totalARR)}
          sub={`${kpis.activeCount} active contracts`}
          icon={<DollarSign size={16} />}
          trend="up"
          trendLabel="FY2024 run rate"
          accent="#4F8EF7"
        />
        <KPICard
          label="Recognized YTD"
          value={fmtFull(kpis.recognizedYTD)}
          sub={`${((kpis.recognizedYTD / kpis.totalTCV) * 100).toFixed(1)}% of total TCV`}
          icon={<TrendingUp size={16} />}
          trend="up"
          trendLabel="vs prior period"
          accent="#34D399"
        />
        <KPICard
          label="Deferred Balance"
          value={fmtFull(kpis.deferredBalance)}
          sub="Remaining to recognize"
          icon={<DollarSign size={16} />}
          accent="#F59E0B"
        />
        <KPICard
          label="Modified Contracts"
          value={String(kpis.modifiedCount)}
          sub={`${kpis.activeCount} active · ${contracts.filter(c => c.status === 'Draft').length} draft`}
          icon={<AlertTriangle size={16} />}
          trend={kpis.modifiedCount > 0 ? 'neutral' : 'up'}
          trendLabel="Require review"
          accent="#F59E0B"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recognition waterfall */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-200">Monthly Recognition Waterfall</h2>
            <span className="text-xs text-gray-500">12-month portfolio view</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={waterfallData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} width={55} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, name: string) => [fmtFull(v), name === 'recognized' ? 'Recognized' : 'Deferred']}
              />
              <Bar dataKey="recognized" fill="#4F8EF7" radius={[3, 3, 0, 0]} name="recognized" />
              <Bar dataKey="deferred" fill="rgba(79,142,247,0.2)" radius={[3, 3, 0, 0]} name="deferred" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-2 rounded-sm bg-[#4F8EF7] inline-block" /> Recognized</div>
            <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-2 rounded-sm bg-[#4F8EF7]/20 inline-block" /> Deferred</div>
          </div>
        </div>

        {/* PO Type Breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Revenue by PO Type</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                {breakdown.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmtFull(v)]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {breakdown.map((item, i) => (
              <div key={item.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-400">{item.type}</span>
                </div>
                <span className="num text-gray-300">{fmt(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Contracts */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-200">Top Contracts by TCV</h2>
            <Link to="/contracts" className="text-xs text-[#4F8EF7] hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-600 border-b border-white/5">
                <th className="text-left pb-2 font-medium">Customer</th>
                <th className="text-right pb-2 font-medium">TCV</th>
                <th className="text-right pb-2 font-medium">Recog'd</th>
                <th className="text-right pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {topContracts.map(c => (
                <tr key={c.id} className="border-b border-white/4 table-row-hover">
                  <td className="py-2.5 text-gray-300">
                    <Link to={`/contracts/${c.id}`} className="hover:text-[#4F8EF7]">{c.customer}</Link>
                    <div className="text-gray-600 num">{c.contractNumber}</div>
                  </td>
                  <td className="py-2.5 text-right num text-gray-300">{fmt(c.tcv)}</td>
                  <td className="py-2.5 text-right num text-gray-400">
                    {((c.recognizedToDate / c.tcv) * 100).toFixed(0)}%
                  </td>
                  <td className="py-2.5 text-right">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Contracts requiring attention + Audit */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Contracts Requiring Attention</h2>
          <div className="space-y-2 mb-5">
            {attention.length === 0 ? (
              <p className="text-xs text-gray-500">No contracts require attention.</p>
            ) : (
              attention.slice(0, 4).map(c => (
                <Link key={c.id} to={`/contracts/${c.id}`} className="flex items-start gap-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/30 transition-colors block">
                  <AlertTriangle size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-200 font-medium truncate">{c.customer} — {c.contractNumber}</div>
                    <div className="text-[11px] text-gray-500">
                      {c.status === 'Modified' && 'Catch-up adjustment · '}
                      {c.status === 'Draft' && 'Draft — not executed · '}
                      {c.performanceObligations.some(po => po.variableConsideration) && 'Variable consideration constrained'}
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))
            )}
          </div>
          <div className="border-t border-white/8 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recent Audit Events</h3>
            </div>
            <div className="space-y-2">
              {audit.slice(0, 4).map(entry => (
                <div key={entry.id} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7] mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-300">{entry.action}</div>
                    <div className="text-[11px] text-gray-600 truncate">{entry.contractNumber} · {format(parseISO(entry.timestamp), 'MMM d, yyyy')}</div>
                  </div>
                  {entry.amount !== undefined && (
                    <span className={`num text-xs flex-shrink-0 ${entry.amount < 0 ? 'text-red-400' : 'text-[#34D399]'}`}>
                      {entry.amount < 0 ? '-' : '+'}${Math.abs(entry.amount).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
