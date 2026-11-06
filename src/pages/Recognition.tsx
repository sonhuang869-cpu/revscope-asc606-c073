import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { getContracts } from '../lib/api'
import { getRecognitionSchedule, getCurrentMonthRecognition, getPOTypeBreakdown } from '../lib/calculations'
import type { Contract } from '../types'
import { format, parseISO, startOfMonth, addMonths } from 'date-fns'

const PIE_COLORS = ['#4F8EF7', '#34D399', '#F59E0B', '#a78bfa', '#f87171']
function fmt(n: number) { return '$' + Math.round(n).toLocaleString('en-US') }

export function Recognition() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getContracts().then(c => { setContracts(c); setLoading(false) })
  }, [])

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading recognition data…</div>

  const activeContracts = contracts.filter(c => c.status !== 'Draft' && c.status !== 'Terminated')
  const currentMonth = format(new Date(), 'MMM yyyy')
  const currentRecog = getCurrentMonthRecognition(contracts)
  const totalCurrentMonth = currentRecog.reduce((s, r) => s + r.amount, 0)

  // 24-month portfolio waterfall
  const months: Record<string, { recognized: number; deferred: number }> = {}
  for (let i = -6; i < 18; i++) {
    const m = format(addMonths(startOfMonth(new Date()), i), 'MMM yyyy')
    months[m] = { recognized: 0, deferred: 0 }
  }
  for (const c of activeContracts) {
    const schedule = getRecognitionSchedule(c)
    for (const entry of schedule) {
      if (months[entry.month]) {
        months[entry.month].recognized += entry.recognized
        months[entry.month].deferred += entry.deferred
      }
    }
  }
  const waterfallData = Object.entries(months).map(([month, v]) => ({
    month: month.split(' ')[0] + "'" + month.split(' ')[1].slice(2),
    fullMonth: month,
    recognized: Math.round(v.recognized),
    deferred: Math.round(v.deferred),
    isCurrent: month === currentMonth,
  }))

  // Cumulative recognition line
  let cumulative = 0
  const cumulativeData = waterfallData.map(row => {
    cumulative += row.recognized
    return { ...row, cumulative }
  })

  // PO type breakdown
  const breakdown = getPOTypeBreakdown(contracts)
  const totalAllocated = breakdown.reduce((s, b) => s + b.value, 0)

  // Deferred balance per customer
  const customerDeferred = activeContracts.reduce((acc, c) => {
    const remaining = c.tcv - c.recognizedToDate
    if (!acc[c.customer]) acc[c.customer] = 0
    acc[c.customer] += remaining
    return acc
  }, {} as Record<string, number>)

  const deferredByCustomer = Object.entries(customerDeferred)
    .sort((a, b) => b[1] - a[1])
    .map(([customer, deferred]) => ({ customer, deferred }))

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Revenue Recognition</h1>
          <p className="text-sm text-gray-500 mt-0.5">Portfolio-wide recognition schedule & waterfall</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Current Month ({currentMonth})</div>
          <div className="num text-xl font-semibold text-[#34D399]">{fmt(totalCurrentMonth)}</div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Recognizing This Month', value: fmt(totalCurrentMonth), sub: `${currentRecog.length} line items` },
          { label: 'Total Recognized (All Time)', value: fmt(contracts.reduce((s, c) => s + c.recognizedToDate, 0)), sub: 'Across all contracts' },
          { label: 'Total Deferred Balance', value: fmt(contracts.reduce((s, c) => s + (c.tcv - c.recognizedToDate), 0)), sub: 'Remaining to recognize' },
          { label: 'Active Contracts', value: String(activeContracts.length), sub: 'Generating revenue' },
        ].map(k => (
          <div key={k.label} className="card px-4 py-3">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{k.label}</div>
            <div className="num text-lg font-semibold text-white">{k.value}</div>
            <div className="text-xs text-gray-600 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 24-month waterfall */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">24-Month Recognition Waterfall</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={waterfallData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number, name: string) => [fmt(v), name === 'recognized' ? 'Recognized' : 'Deferred Balance']}
                labelFormatter={(l) => `Month: ${l}`}
              />
              <Bar dataKey="recognized" fill="#4F8EF7" radius={[3, 3, 0, 0]} name="recognized"
                label={false}
              />
              <Bar dataKey="deferred" fill="rgba(79,142,247,0.15)" radius={[3, 3, 0, 0]} name="deferred" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1">
            <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-2 rounded-sm bg-[#4F8EF7] inline-block" /> Recognized</div>
            <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-3 h-2 rounded-sm bg-[#4F8EF7]/15 inline-block" /> Deferred Bal.</div>
          </div>
        </div>

        {/* PO type breakdown */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">By PO Type (Allocated $)</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={breakdown} dataKey="value" nameKey="type" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                {breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [fmt(v)]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {breakdown.map((item, i) => (
              <div key={item.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-gray-400">{item.type}</span>
                </div>
                <div className="text-right">
                  <span className="num text-gray-300">{fmt(item.value)}</span>
                  <span className="text-gray-600 ml-1">({((item.value / totalAllocated) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cumulative line chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-200 mb-4">Cumulative Recognition Trend</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={cumulativeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
            <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={52} />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
              formatter={(v: number) => [fmt(v), 'Cumulative Recognized']}
            />
            <Line type="monotone" dataKey="cumulative" stroke="#34D399" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Current month recognition detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">
            Current Period Recognition — {currentMonth}
          </h2>
          {currentRecog.length === 0 ? (
            <p className="text-sm text-gray-500">No recognition in the current month.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-600 border-b border-white/8">
                  <th className="text-left pb-2 font-medium">Contract</th>
                  <th className="text-left pb-2 font-medium">PO</th>
                  <th className="text-right pb-2 font-medium">Amount</th>
                  <th className="text-left pb-2 font-medium pl-3">Journal</th>
                </tr>
              </thead>
              <tbody>
                {currentRecog.map((r, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/2">
                    <td className="py-2">
                      <Link to={`/contracts/${r.contract.id}`} className="text-[#4F8EF7] hover:underline font-medium">
                        {r.contract.contractNumber}
                      </Link>
                      <div className="text-gray-600">{r.contract.customer}</div>
                    </td>
                    <td className="py-2 text-gray-400">{r.po.name}</td>
                    <td className="py-2 text-right num text-[#34D399] font-medium">{fmt(r.amount)}</td>
                    <td className="py-2 pl-3 text-gray-600 font-mono text-[10px]">Dr Def Rev / Cr Rev</td>
                  </tr>
                ))}
                <tr className="border-t border-white/15">
                  <td colSpan={2} className="pt-2 text-gray-400 font-semibold">Total</td>
                  <td className="pt-2 text-right num text-white font-semibold">{fmt(totalCurrentMonth)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Deferred balance by customer */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Deferred Balance by Customer</h2>
          <div className="space-y-3">
            {deferredByCustomer.map(({ customer, deferred }) => {
              const totalDeferred = deferredByCustomer.reduce((s, r) => s + r.deferred, 0)
              const pct = totalDeferred > 0 ? (deferred / totalDeferred) * 100 : 0
              return (
                <div key={customer}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{customer}</span>
                    <span className="num text-gray-400">{fmt(deferred)}</span>
                  </div>
                  <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4F8EF7] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
