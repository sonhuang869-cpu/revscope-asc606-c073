import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Clock, RefreshCcw } from 'lucide-react'
import { getContracts, getAuditLog, resetDemoData } from '../lib/api'
import { getASC606Steps } from '../lib/calculations'
import { StatusBadge } from '../components/StatusBadge'
import type { Contract, AuditEntry } from '../types'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'

function fmt(n: number) { return '$' + Math.round(n).toLocaleString('en-US') }

function StepDot({ status }: { status: string }) {
  if (status === 'complete') return <CheckCircle2 size={14} className="text-[#34D399] flex-shrink-0" />
  if (status === 'warning') return <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
  return <Clock size={14} className="text-gray-500 flex-shrink-0" />
}

function overallStatus(steps: ReturnType<typeof getASC606Steps>) {
  if (steps.every(s => s.status === 'complete')) return 'complete'
  if (steps.some(s => s.status === 'warning' || s.status === 'pending')) return 'warning'
  return 'pending'
}

export function Compliance() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [audit, setAudit] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [expandedContract, setExpandedContract] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getContracts(), getAuditLog()]).then(([c, a]) => {
      setContracts(c)
      setAudit(a)
      setLoading(false)
    })
  }, [])

  async function handleReset() {
    setResetting(true)
    await resetDemoData()
    const [c, a] = await Promise.all([getContracts(), getAuditLog()])
    setContracts(c)
    setAudit(a)
    setResetting(false)
    toast.success('Demo data reset to original seed data')
  }

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading compliance data…</div>

  const contractSteps = contracts.map(c => ({
    contract: c,
    steps: getASC606Steps(c),
  }))

  const complete = contractSteps.filter(cs => overallStatus(cs.steps) === 'complete')
  const warning = contractSteps.filter(cs => overallStatus(cs.steps) === 'warning')
  const pending = contractSteps.filter(cs => overallStatus(cs.steps) === 'pending')

  const attention = contracts.filter(c =>
    c.status === 'Modified' ||
    c.status === 'Draft' ||
    c.performanceObligations.some(po => po.variableConsideration)
  )

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Compliance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">ASC 606 five-step checklist across all contracts</p>
        </div>
        <button onClick={handleReset} disabled={resetting}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50">
          <RefreshCcw size={13} className={resetting ? 'animate-spin' : ''} />
          Reset Demo Data
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card px-4 py-3 border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={13} className="text-[#34D399]" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Fully Compliant</span>
          </div>
          <div className="num text-2xl font-semibold text-[#34D399]">{complete.length}</div>
          <div className="text-xs text-gray-600">All 5 steps complete</div>
        </div>
        <div className="card px-4 py-3 border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={13} className="text-amber-400" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Needs Review</span>
          </div>
          <div className="num text-2xl font-semibold text-amber-400">{warning.length}</div>
          <div className="text-xs text-gray-600">At least one warning</div>
        </div>
        <div className="card px-4 py-3 border-gray-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={13} className="text-gray-500" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Pending</span>
          </div>
          <div className="num text-2xl font-semibold text-gray-400">{pending.length}</div>
          <div className="text-xs text-gray-600">Not yet started</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ASC 606 Checklist per contract */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">Per-Contract ASC 606 Checklist</h2>
          <div className="space-y-2">
            {contractSteps.map(({ contract: c, steps }) => {
              const status = overallStatus(steps)
              const isExpanded = expandedContract === c.id
              return (
                <div key={c.id} className="card overflow-hidden">
                  <button
                    onClick={() => setExpandedContract(isExpanded ? null : c.id)}
                    className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-white/3 transition-colors text-left"
                  >
                    {status === 'complete' ? (
                      <CheckCircle2 size={15} className="text-[#34D399] flex-shrink-0" />
                    ) : status === 'warning' ? (
                      <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />
                    ) : (
                      <Clock size={15} className="text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-200 font-medium">{c.customer}</span>
                        <span className="num text-xs text-gray-500">{c.contractNumber}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="flex gap-1 mt-1.5">
                        {steps.map(step => (
                          <div
                            key={step.step}
                            className={`h-1 flex-1 rounded-full ${
                              step.status === 'complete' ? 'bg-[#34D399]' :
                              step.status === 'warning' ? 'bg-amber-400' : 'bg-white/15'
                            }`}
                            title={`Step ${step.step}: ${step.label}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="num text-sm text-gray-300">{fmt(c.tcv)}</div>
                      <div className="text-[10px] text-gray-600">{steps.filter(s => s.status === 'complete').length}/5 steps</div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-white/8 px-5 py-4 bg-black/20">
                      <div className="space-y-3">
                        {steps.map(step => (
                          <div key={step.step} className="flex items-start gap-3">
                            <StepDot status={step.status} />
                            <div>
                              <div className="text-xs text-gray-200 font-medium">
                                Step {step.step}: {step.label}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-0.5">{step.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link to={`/contracts/${c.id}`} className="mt-3 inline-flex items-center text-xs text-[#4F8EF7] hover:underline">
                        View full contract →
                      </Link>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Attention items */}
          <div className="card p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contracts Requiring Attention</h2>
            {attention.length === 0 ? (
              <p className="text-xs text-gray-500">No contracts require immediate attention.</p>
            ) : (
              <div className="space-y-2">
                {attention.map(c => (
                  <Link key={c.id} to={`/contracts/${c.id}`}
                    className="flex flex-col gap-1 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 hover:border-amber-500/30 transition-colors block">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-200 font-medium">{c.customer}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <span className="num text-[10px] text-gray-500">{c.contractNumber}</span>
                    <div className="text-[10px] text-amber-400 mt-0.5">
                      {c.status === 'Modified' && `${c.modifications.length} modification(s) — catch-up review needed`}
                      {c.status === 'Draft' && 'Draft — not yet executed'}
                      {c.performanceObligations.some(po => po.variableConsideration) && ' · Variable consideration constrained'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Audit Trail */}
          <div className="card p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Audit Trail</h2>
            <div className="space-y-3">
              {audit.slice(0, 12).map(entry => (
                <div key={entry.id} className="flex items-start gap-2.5 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${
                    entry.action.includes('Catch-up') ? 'bg-amber-400' :
                    entry.action.includes('Delivered') || entry.action.includes('Recognition') ? 'bg-[#34D399]' :
                    'bg-[#4F8EF7]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-200 font-medium">{entry.action}</div>
                    <div className="text-gray-500 truncate">{entry.details}</div>
                    <div className="text-gray-700 flex items-center gap-2 mt-0.5">
                      <span className="num">{entry.contractNumber}</span>
                      <span>·</span>
                      <span>{format(parseISO(entry.timestamp), 'MMM d, yyyy HH:mm')}</span>
                      <span>·</span>
                      <span>{entry.user}</span>
                    </div>
                  </div>
                  {entry.amount !== undefined && (
                    <span className={`num flex-shrink-0 font-medium ${entry.amount < 0 ? 'text-red-400' : 'text-[#34D399]'}`}>
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
