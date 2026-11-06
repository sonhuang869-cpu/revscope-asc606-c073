import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getContract } from '../lib/api'
import { getRecognitionSchedule, getAllocations, getASC606Steps, getDeferredRollforward } from '../lib/calculations'
import { StatusBadge } from '../components/StatusBadge'
import type { Contract } from '../types'
import { format, parseISO } from 'date-fns'

function fmt(n: number) { return '$' + Math.round(n).toLocaleString('en-US') }
function pct(n: number, d: number) { return d ? ((n / d) * 100).toFixed(1) + '%' : '—' }

const PO_TYPE_COLORS: Record<string, string> = {
  License: '#4F8EF7',
  SaaS: '#34D399',
  'Professional Services': '#F59E0B',
  Support: '#a78bfa',
  Training: '#f87171',
}

export function ContractDetail() {
  const { id } = useParams<{ id: string }>()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAllMonths, setShowAllMonths] = useState(false)
  const [activeTab, setActiveTab] = useState<'schedule' | 'journal' | 'rollforward'>('schedule')

  useEffect(() => {
    if (!id) return
    getContract(id).then(c => { setContract(c); setLoading(false) })
  }, [id])

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading contract…</div>
  if (!contract) return (
    <div className="p-6">
      <p className="text-red-400">Contract not found.</p>
      <Link to="/contracts" className="text-[#4F8EF7] text-sm mt-2 inline-block">← Back to contracts</Link>
    </div>
  )

  const schedule = getRecognitionSchedule(contract)
  const allocations = getAllocations(contract.performanceObligations, contract.tcv)
  const steps = getASC606Steps(contract)
  const rollforward = getDeferredRollforward(contract)

  const displaySchedule = showAllMonths ? schedule : schedule.slice(0, 12)
  const chartData = schedule.slice(0, 24).map(e => ({
    month: e.month.split(' ')[0] + "'" + e.month.split(' ')[1].slice(2),
    ...Object.fromEntries(
      contract.performanceObligations.map(po => [po.name.split(' ')[0], Math.round(e.byPO[po.id] ?? 0)])
    ),
    total: Math.round(e.recognized),
  }))

  const stepStatusIcon = (s: string) => {
    if (s === 'complete') return <CheckCircle2 size={14} className="text-[#34D399]" />
    if (s === 'warning') return <AlertCircle size={14} className="text-amber-400" />
    return <Clock size={14} className="text-gray-500" />
  }

  const currentMonthRecog = schedule.find(e => e.month === format(new Date(), 'MMM yyyy'))

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/contracts" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors mt-0.5">
          <ArrowLeft size={16} className="text-gray-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-white">{contract.customer}</h1>
            <StatusBadge status={contract.status} />
            {contract.modifications.length > 0 && (
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                {contract.modifications.length} modification{contract.modifications.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="num text-sm text-gray-500 mt-0.5">{contract.contractNumber} · {contract.billingSchedule} billing</p>
          {contract.notes && <p className="text-xs text-gray-500 mt-1">{contract.notes}</p>}
        </div>
        <div className="text-right hidden md:block">
          <div className="num text-2xl font-semibold text-white">{fmt(contract.tcv)}</div>
          <div className="text-xs text-gray-500">Total Contract Value</div>
        </div>
      </div>

      {/* Key metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'TCV', value: fmt(contract.tcv) },
          { label: 'Recognized to Date', value: fmt(contract.recognizedToDate) },
          { label: 'Remaining Deferred', value: fmt(contract.tcv - contract.recognizedToDate) },
          { label: 'Recognition Progress', value: pct(contract.recognizedToDate, contract.tcv) },
        ].map(item => (
          <div key={item.label} className="card px-4 py-3">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
            <div className="num text-lg font-semibold text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Contract header details */}
          <div className="card p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contract Details</h2>
            <dl className="space-y-2 text-xs">
              {[
                ['Contract #', contract.contractNumber],
                ['Customer', contract.customer],
                ['Start Date', format(parseISO(contract.startDate), 'MMM d, yyyy')],
                ['End Date', format(parseISO(contract.endDate), 'MMM d, yyyy')],
                ['Billing', contract.billingSchedule],
                ['Status', contract.status],
                ['Last Updated', format(parseISO(contract.updatedAt), 'MMM d, yyyy')],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="text-gray-200 font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ASC 606 Checklist */}
          <div className="card p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ASC 606 — 5-Step Checklist</h2>
            <div className="space-y-2.5">
              {steps.map(step => (
                <div key={step.step} className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 mt-0.5">{stepStatusIcon(step.status)}</div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-200 font-medium">Step {step.step}: {step.label}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{step.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modifications */}
          {contract.modifications.length > 0 && (
            <div className="card p-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contract Modifications</h2>
              <div className="space-y-3">
                {contract.modifications.map(mod => (
                  <div key={mod.id} className="border-l-2 border-amber-500/50 pl-3">
                    <div className="text-xs text-gray-200 font-medium">{mod.type}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{mod.description}</div>
                    <div className="text-[11px] text-gray-600 mt-0.5">{format(parseISO(mod.date), 'MMM d, yyyy')}</div>
                    {mod.catchUpAmount !== undefined && (
                      <div className={`text-[11px] num font-medium mt-1 ${mod.catchUpAmount < 0 ? 'text-red-400' : 'text-[#34D399]'}`}>
                        Catch-up: {mod.catchUpAmount < 0 ? '-' : '+'}${Math.abs(mod.catchUpAmount).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* PO Allocation Table */}
          <div className="card p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Performance Obligations & Allocation
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-600 border-b border-white/8">
                    <th className="text-left pb-2 font-medium">PO Name</th>
                    <th className="text-left pb-2 font-medium">Type</th>
                    <th className="text-right pb-2 font-medium">SSP</th>
                    <th className="text-right pb-2 font-medium">SSP %</th>
                    <th className="text-right pb-2 font-medium">Allocated</th>
                    <th className="text-right pb-2 font-medium">% of TCV</th>
                    <th className="text-left pb-2 font-medium pl-3">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(po => (
                    <tr key={po.id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2.5 text-gray-200 font-medium pr-4">{po.name}</td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: `${PO_TYPE_COLORS[po.type]}18`, color: PO_TYPE_COLORS[po.type] }}>
                          {po.type}
                        </span>
                      </td>
                      <td className="py-2.5 text-right num text-gray-300">{fmt(po.ssp)}</td>
                      <td className="py-2.5 text-right num text-gray-400">{po.sspPercent.toFixed(1)}%</td>
                      <td className="py-2.5 text-right num text-white font-medium">{fmt(po.allocatedAmount)}</td>
                      <td className="py-2.5 text-right num text-gray-400">{po.pctOfTCV.toFixed(1)}%</td>
                      <td className="py-2.5 pl-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          po.recognitionMethod === 'Point in Time'
                            ? 'bg-[#4F8EF7]/10 text-[#4F8EF7]'
                            : 'bg-[#34D399]/10 text-[#34D399]'
                        }`}>
                          {po.recognitionMethod}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/15">
                    <td className="pt-2 text-gray-400 font-semibold" colSpan={2}>Total</td>
                    <td className="pt-2 text-right num text-gray-300 font-semibold">
                      {fmt(allocations.reduce((s, p) => s + p.ssp, 0))}
                    </td>
                    <td className="pt-2 text-right num text-gray-400">100%</td>
                    <td className="pt-2 text-right num text-white font-semibold">{fmt(contract.tcv)}</td>
                    <td className="pt-2 text-right num text-gray-400">100%</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Variable Consideration */}
            {contract.performanceObligations.some(po => po.variableConsideration) && (
              <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <h3 className="text-xs font-semibold text-amber-400 mb-2">Variable Consideration</h3>
                {contract.performanceObligations.filter(po => po.variableConsideration).map(po => (
                  <div key={po.id} className="text-xs space-y-1">
                    <div className="text-gray-200">{po.name}</div>
                    <div className="flex gap-6 text-gray-400">
                      <span>Est. Amount: <span className="num text-gray-300">{fmt(po.variableConsideration!.estimatedAmount)}</span></span>
                      <span>Method: <span className="text-gray-300">{po.variableConsideration!.method}</span></span>
                      <span>Constrained: <span className="num text-[#34D399]">{fmt(po.variableConsideration!.constrainedAmount)}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recognition Schedule */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Recognition Schedule</h2>
              <div className="flex gap-1">
                {(['schedule', 'journal', 'rollforward'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                      activeTab === tab ? 'bg-[#1E3A5F] text-[#4F8EF7]' : 'text-gray-500 hover:text-gray-300'
                    }`}>
                    {tab === 'rollforward' ? 'Rollforward' : tab === 'journal' ? 'Journal Entry' : 'Waterfall'}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'schedule' && (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData.slice(0, 18)} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={48} />
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                      formatter={(v: number) => ['$' + v.toLocaleString()]}
                    />
                    {contract.performanceObligations.map(po => (
                      <Bar key={po.id} dataKey={po.name.split(' ')[0]} stackId="a"
                        fill={PO_TYPE_COLORS[po.type]} name={po.name} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-600 border-b border-white/8">
                        <th className="text-left pb-2 font-medium">Month</th>
                        <th className="text-right pb-2 font-medium">Recognized</th>
                        <th className="text-right pb-2 font-medium">Deferred Bal.</th>
                        {contract.performanceObligations.map(po => (
                          <th key={po.id} className="text-right pb-2 font-medium pl-3">
                            {po.name.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displaySchedule.map((entry, i) => {
                        const isCurrentMonth = entry.month === format(new Date(), 'MMM yyyy')
                        return (
                          <tr key={i} className={`border-b border-white/4 ${isCurrentMonth ? 'bg-[#4F8EF7]/5' : 'hover:bg-white/2'}`}>
                            <td className={`py-1.5 ${isCurrentMonth ? 'text-[#4F8EF7] font-medium' : 'text-gray-400'}`}>
                              {entry.month} {isCurrentMonth && '◀'}
                            </td>
                            <td className="py-1.5 text-right num text-gray-200">{fmt(entry.recognized)}</td>
                            <td className="py-1.5 text-right num text-gray-500">{fmt(entry.deferred)}</td>
                            {contract.performanceObligations.map(po => (
                              <td key={po.id} className="py-1.5 text-right num text-gray-400 pl-3">
                                {entry.byPO[po.id] ? fmt(entry.byPO[po.id]) : '—'}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {schedule.length > 12 && (
                    <button
                      onClick={() => setShowAllMonths(v => !v)}
                      className="mt-2 text-xs text-[#4F8EF7] hover:underline flex items-center gap-1"
                    >
                      {showAllMonths ? <><ChevronUp size={12} /> Show fewer months</> : <><ChevronDown size={12} /> Show all {schedule.length} months</>}
                    </button>
                  )}
                </div>
              </>
            )}

            {activeTab === 'journal' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Journal entry preview for current month recognition ({format(new Date(), 'MMMM yyyy')})</p>
                {currentMonthRecog && currentMonthRecog.recognized > 0 ? (
                  <div className="font-mono text-xs space-y-1 p-4 bg-black/30 rounded-lg border border-white/8">
                    <div className="text-gray-500 mb-2">// {format(new Date(), 'MMMM d, yyyy')} — Revenue Recognition Entry</div>
                    <div className="flex justify-between">
                      <span className="text-amber-400">Dr  Deferred Revenue</span>
                      <span className="text-gray-200">{fmt(currentMonthRecog.recognized)}</span>
                    </div>
                    <div className="flex justify-between pl-8">
                      <span className="text-[#34D399]">Cr  Revenue</span>
                      <span className="text-gray-200">{fmt(currentMonthRecog.recognized)}</span>
                    </div>
                    <div className="text-gray-600 mt-2 pt-2 border-t border-white/8">
                      // Ref: {contract.contractNumber} · ASC 606 periodic recognition
                    </div>
                    <div className="text-gray-700 mt-1">
                      // Breakdown by PO:
                    </div>
                    {contract.performanceObligations.map(po => {
                      const amt = currentMonthRecog.byPO[po.id] ?? 0
                      if (!amt) return null
                      return (
                        <div key={po.id} className="text-gray-600 pl-4">
                          //   {po.name}: {fmt(amt)}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 p-4 bg-black/20 rounded-lg">No recognition in the current month for this contract.</p>
                )}
              </div>
            )}

            {activeTab === 'rollforward' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">Deferred revenue rollforward — current period</p>
                <div className="space-y-1">
                  {[
                    { label: 'Opening Balance', value: rollforward.opening, border: false },
                    { label: 'Additions (new billings)', value: rollforward.additions, border: false },
                    { label: 'Recognized in period', value: -rollforward.recognized, border: false },
                    { label: 'Ending Balance', value: rollforward.ending, border: true },
                  ].map(row => (
                    <div key={row.label} className={`flex justify-between items-center py-2 text-sm ${row.border ? 'border-t border-white/15 font-semibold text-white' : 'text-gray-300'}`}>
                      <span className={row.border ? '' : 'text-gray-400'}>{row.label}</span>
                      <span className={`num ${row.value < 0 ? 'text-red-400' : ''}`}>
                        {row.value < 0 ? `(${fmt(Math.abs(row.value))})` : fmt(row.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
