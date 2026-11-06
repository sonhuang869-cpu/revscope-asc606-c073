import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createContract } from '../lib/api'
import type { POType, BillingSchedule, RecognitionMethod } from '../types'

const PO_TYPES: POType[] = ['SaaS', 'License', 'Professional Services', 'Support', 'Training']
const BILLING_OPTIONS: BillingSchedule[] = ['Monthly', 'Upfront', 'Milestone']
const RECOG_METHODS: RecognitionMethod[] = ['Over Time', 'Point in Time']

interface PODraft {
  name: string
  type: POType
  ssp: string
  recognitionMethod: RecognitionMethod
  startDate: string
  endDate: string
}

export function NewContract() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    contractNumber: '',
    customer: '',
    tcv: '',
    startDate: '',
    endDate: '',
    billingSchedule: 'Monthly' as BillingSchedule,
    notes: '',
  })

  const [pos, setPOs] = useState<PODraft[]>([
    { name: '', type: 'SaaS', ssp: '', recognitionMethod: 'Over Time', startDate: '', endDate: '' }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.contractNumber.trim()) e.contractNumber = 'Required'
    if (!form.customer.trim()) e.customer = 'Required'
    if (!form.tcv || isNaN(Number(form.tcv)) || Number(form.tcv) <= 0) e.tcv = 'Must be a positive number'
    if (!form.startDate) e.startDate = 'Required'
    if (!form.endDate) e.endDate = 'Required'
    if (form.startDate && form.endDate && form.startDate >= form.endDate) e.endDate = 'Must be after start date'
    pos.forEach((po, i) => {
      if (!po.name.trim()) e[`po_${i}_name`] = 'Required'
      if (!po.ssp || isNaN(Number(po.ssp)) || Number(po.ssp) <= 0) e[`po_${i}_ssp`] = 'Must be positive'
      if (!po.startDate) e[`po_${i}_start`] = 'Required'
      if (!po.endDate) e[`po_${i}_end`] = 'Required'
    })
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const tcv = Number(form.tcv)
      const totalSSP = pos.reduce((s, p) => s + Number(p.ssp), 0)
      const contract = await createContract({
        contractNumber: form.contractNumber,
        customer: form.customer,
        tcv,
        startDate: form.startDate,
        endDate: form.endDate,
        billingSchedule: form.billingSchedule,
        status: 'Draft',
        recognizedToDate: 0,
        notes: form.notes,
        modifications: [],
        performanceObligations: pos.map((po, i) => ({
          id: `po_new_${i}`,
          contractId: '',
          name: po.name,
          type: po.type,
          ssp: Number(po.ssp),
          recognitionMethod: po.recognitionMethod,
          startDate: po.startDate,
          endDate: po.endDate,
          allocatedAmount: totalSSP > 0 ? (Number(po.ssp) / totalSSP) * tcv : 0,
        })),
      })
      toast.success(`Contract ${contract.contractNumber} created successfully`)
      navigate(`/contracts/${contract.id}`)
    } catch {
      toast.error('Failed to create contract')
    } finally {
      setSubmitting(false)
    }
  }

  function updatePO(i: number, field: keyof PODraft, value: string) {
    setPOs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  function addPO() {
    setPOs(prev => [...prev, { name: '', type: 'SaaS', ssp: '', recognitionMethod: 'Over Time', startDate: form.startDate, endDate: form.endDate }])
  }

  function removePO(i: number) {
    if (pos.length === 1) return
    setPOs(prev => prev.filter((_, idx) => idx !== i))
  }

  const totalSSP = pos.reduce((s, p) => s + (Number(p.ssp) || 0), 0)
  const tcv = Number(form.tcv) || 0

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )

  const inputCls = (err?: string) =>
    `w-full px-3 py-2 bg-[#0D1526] border ${err ? 'border-red-500/50' : 'border-white/10'} rounded-lg text-sm text-gray-200 focus:outline-none focus:border-[#4F8EF7] transition-colors placeholder-gray-600`

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/contracts" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft size={16} className="text-gray-400" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white">New Contract</h1>
          <p className="text-sm text-gray-500">Define contract terms and performance obligations</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contract Details */}
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contract Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Contract Number" error={errors.contractNumber}>
              <input value={form.contractNumber} onChange={e => setForm(f => ({ ...f, contractNumber: e.target.value }))}
                placeholder="CNT-2024-0013" className={inputCls(errors.contractNumber)} />
            </Field>
            <Field label="Customer Name" error={errors.customer}>
              <input value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))}
                placeholder="e.g. Meridian Healthcare" className={inputCls(errors.customer)} />
            </Field>
            <Field label="Total Contract Value (TCV)" error={errors.tcv}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input value={form.tcv} onChange={e => setForm(f => ({ ...f, tcv: e.target.value }))}
                  placeholder="250000" className={`${inputCls(errors.tcv)} pl-7 num`} />
              </div>
            </Field>
            <Field label="Billing Schedule">
              <select value={form.billingSchedule} onChange={e => setForm(f => ({ ...f, billingSchedule: e.target.value as BillingSchedule }))}
                className={inputCls()}>
                {BILLING_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Start Date" error={errors.startDate}>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className={inputCls(errors.startDate)} />
            </Field>
            <Field label="End Date" error={errors.endDate}>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className={inputCls(errors.endDate)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes (optional)">
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional context…" className={inputCls()} />
              </Field>
            </div>
          </div>
        </div>

        {/* Performance Obligations */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Performance Obligations</h2>
            <div className="text-xs text-gray-500">
              Total SSP: <span className="num text-gray-300">${totalSSP.toLocaleString()}</span>
              {tcv > 0 && totalSSP > 0 && (
                <span className={`ml-2 ${Math.abs(totalSSP - tcv) / tcv < 0.01 ? 'text-[#34D399]' : 'text-amber-400'}`}>
                  vs TCV: ${tcv.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {pos.map((po, i) => (
              <div key={i} className="p-4 bg-black/20 rounded-lg border border-white/8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-300">PO #{i + 1}</span>
                  {pos.length > 1 && (
                    <button type="button" onClick={() => removePO(i)} className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <Field label="PO Name" error={errors[`po_${i}_name`]}>
                      <input value={po.name} onChange={e => updatePO(i, 'name', e.target.value)}
                        placeholder="e.g. SaaS Platform License" className={inputCls(errors[`po_${i}_name`])} />
                    </Field>
                  </div>
                  <Field label="Type">
                    <select value={po.type} onChange={e => updatePO(i, 'type', e.target.value)}
                      className={inputCls()}>
                      {PO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Standalone Selling Price" error={errors[`po_${i}_ssp`]}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input value={po.ssp} onChange={e => updatePO(i, 'ssp', e.target.value)}
                        placeholder="150000" className={`${inputCls(errors[`po_${i}_ssp`])} pl-7 num`} />
                    </div>
                    {tcv > 0 && Number(po.ssp) > 0 && totalSSP > 0 && (
                      <p className="text-[10px] text-gray-500 mt-1 num">
                        Allocated: ${((Number(po.ssp) / totalSSP) * tcv).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        ({((Number(po.ssp) / totalSSP) * 100).toFixed(1)}% of TCV)
                      </p>
                    )}
                  </Field>
                  <Field label="Recognition Method">
                    <select value={po.recognitionMethod} onChange={e => updatePO(i, 'recognitionMethod', e.target.value)}
                      className={inputCls()}>
                      {RECOG_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </Field>
                  <div />
                  <Field label="PO Start Date" error={errors[`po_${i}_start`]}>
                    <input type="date" value={po.startDate} onChange={e => updatePO(i, 'startDate', e.target.value)}
                      className={inputCls(errors[`po_${i}_start`])} />
                  </Field>
                  <Field label="PO End Date" error={errors[`po_${i}_end`]}>
                    <input type="date" value={po.endDate} onChange={e => updatePO(i, 'endDate', e.target.value)}
                      className={inputCls(errors[`po_${i}_end`])} />
                  </Field>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addPO}
            className="mt-3 btn-secondary flex items-center gap-2">
            <Plus size={13} />
            Add Performance Obligation
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={submitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-6">
            {submitting ? 'Creating…' : 'Create Contract'}
          </button>
          <Link to="/contracts" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
