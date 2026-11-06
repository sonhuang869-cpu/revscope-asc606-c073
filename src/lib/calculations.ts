import type { Contract, PerformanceObligation, RecognitionEntry } from '../types'
import { differenceInMonths, parseISO, format, addMonths, startOfMonth, isBefore, isAfter } from 'date-fns'

export function getAllocations(pos: PerformanceObligation[], tcv: number) {
  const totalSSP = pos.reduce((sum, po) => sum + po.ssp, 0)
  return pos.map(po => ({
    ...po,
    sspPercent: totalSSP > 0 ? (po.ssp / totalSSP) * 100 : 0,
    allocatedAmount: totalSSP > 0 ? (po.ssp / totalSSP) * tcv : 0,
    pctOfTCV: totalSSP > 0 ? ((po.ssp / totalSSP) * tcv / tcv) * 100 : 0,
  }))
}

export function getRecognitionSchedule(contract: Contract): RecognitionEntry[] {
  const start = parseISO(contract.startDate)
  const end = parseISO(contract.endDate)
  const totalMonths = differenceInMonths(end, start) + 1
  const schedule: RecognitionEntry[] = []

  const pos = contract.performanceObligations
  const totalSSP = pos.reduce((sum, po) => sum + po.ssp, 0)

  for (let i = 0; i < Math.min(totalMonths, 36); i++) {
    const monthStart = startOfMonth(addMonths(start, i))
    const monthLabel = format(monthStart, 'MMM yyyy')
    const byPO: Record<string, number> = {}
    let totalThisMonth = 0

    for (const po of pos) {
      const poStart = parseISO(po.startDate)
      const poEnd = parseISO(po.endDate)
      const allocated = po.allocatedAmount ?? (totalSSP > 0 ? (po.ssp / totalSSP) * contract.tcv : 0)

      if (po.recognitionMethod === 'Point in Time') {
        const poMonth = format(startOfMonth(poStart), 'MMM yyyy')
        if (poMonth === monthLabel) {
          byPO[po.id] = allocated
          totalThisMonth += allocated
        } else {
          byPO[po.id] = 0
        }
      } else {
        // Over time — straight-line within PO period
        if (isBefore(monthStart, poStart) || isAfter(monthStart, poEnd)) {
          byPO[po.id] = 0
        } else {
          const poMonths = differenceInMonths(poEnd, poStart) + 1
          const monthly = allocated / poMonths
          byPO[po.id] = monthly
          totalThisMonth += monthly
        }
      }
    }

    // Deferred = TCV not yet recognized (cumulative remaining)
    const recognizedBefore = schedule.reduce((sum, e) => sum + e.recognized, 0)
    const deferred = contract.tcv - recognizedBefore - totalThisMonth

    schedule.push({
      month: monthLabel,
      recognized: totalThisMonth,
      deferred: Math.max(0, deferred),
      byPO,
    })
  }

  return schedule
}

export function getCurrentMonthRecognition(contracts: Contract[]) {
  const now = new Date()
  const currentMonth = format(now, 'MMM yyyy')
  const results: Array<{ contract: Contract; po: PerformanceObligation; amount: number }> = []

  for (const contract of contracts) {
    if (contract.status === 'Draft' || contract.status === 'Terminated') continue
    const schedule = getRecognitionSchedule(contract)
    const monthEntry = schedule.find(e => e.month === currentMonth)
    if (!monthEntry) continue

    for (const po of contract.performanceObligations) {
      const amount = monthEntry.byPO[po.id] ?? 0
      if (amount > 0) {
        results.push({ contract, po, amount })
      }
    }
  }

  return results
}

export function getDeferredRollforward(contract: Contract) {
  const schedule = getRecognitionSchedule(contract)
  const now = new Date()
  const currentMonth = format(now, 'MMM yyyy')
  const idx = schedule.findIndex(e => e.month === currentMonth)
  const upToNow = idx >= 0 ? schedule.slice(0, idx + 1) : schedule

  const opening = contract.tcv - upToNow.slice(0, -1).reduce((s, e) => s + e.recognized, 0)
  const additionsThisMonth = 0 // No new billings in this simplified model
  const recognizedThisMonth = upToNow[upToNow.length - 1]?.recognized ?? 0
  const ending = opening + additionsThisMonth - recognizedThisMonth

  return {
    opening: Math.max(0, opening),
    additions: additionsThisMonth,
    recognized: recognizedThisMonth,
    ending: Math.max(0, ending),
  }
}

export function getASC606Steps(contract: Contract) {
  const pos = contract.performanceObligations
  const totalSSP = pos.reduce((sum, po) => sum + po.ssp, 0)
  const totalAllocated = pos.reduce((sum, po) => sum + (po.allocatedAmount ?? 0), 0)
  const allAllocated = Math.abs(totalAllocated - contract.tcv) < 1

  return [
    {
      step: 1,
      label: 'Identify the Contract',
      status: contract.status !== 'Draft' ? 'complete' : 'pending',
      detail: contract.status !== 'Draft'
        ? `Contract ${contract.contractNumber} executed with ${contract.customer}`
        : 'Contract in draft — not yet executed',
    },
    {
      step: 2,
      label: 'Identify Performance Obligations',
      status: pos.length > 0 ? 'complete' : 'warning',
      detail: pos.length > 0
        ? `${pos.length} POs identified: ${pos.map(p => p.type).join(', ')}`
        : 'No performance obligations defined',
    },
    {
      step: 3,
      label: 'Determine Transaction Price',
      status: contract.tcv > 0 ? 'complete' : 'warning',
      detail: contract.tcv > 0
        ? `TCV of $${contract.tcv.toLocaleString()} established`
        : 'Transaction price not set',
    },
    {
      step: 4,
      label: 'Allocate Transaction Price',
      status: allAllocated ? 'complete' : pos.some(p => p.variableConsideration) ? 'warning' : 'complete',
      detail: allAllocated
        ? `Allocated across ${pos.length} POs using SSP ratios (total SSP: $${totalSSP.toLocaleString()})`
        : `Allocation variance: $${Math.abs(totalAllocated - contract.tcv).toLocaleString()}`,
    },
    {
      step: 5,
      label: 'Recognize Revenue',
      status: contract.recognizedToDate > 0 ? 'complete' : contract.status === 'Active' ? 'warning' : 'pending',
      detail: contract.recognizedToDate > 0
        ? `$${contract.recognizedToDate.toLocaleString()} recognized to date (${((contract.recognizedToDate / contract.tcv) * 100).toFixed(1)}% of TCV)`
        : 'Recognition not yet started',
    },
  ] as const
}

export function getPortfolioKPIs(contracts: Contract[]) {
  const active = contracts.filter(c => c.status === 'Active' || c.status === 'Modified')
  const totalARR = active.reduce((sum, c) => {
    const years = Math.max(1, differenceInMonths(parseISO(c.endDate), parseISO(c.startDate)) / 12)
    return sum + c.tcv / years
  }, 0)
  const recognizedYTD = contracts.reduce((sum, c) => sum + c.recognizedToDate, 0)
  const totalTCV = contracts.reduce((sum, c) => sum + c.tcv, 0)
  const deferredBalance = totalTCV - recognizedYTD
  const activeCount = contracts.filter(c => c.status === 'Active').length
  const modifiedCount = contracts.filter(c => c.status === 'Modified').length

  return { totalARR, recognizedYTD, deferredBalance, activeCount, modifiedCount, totalTCV }
}

export function getPOTypeBreakdown(contracts: Contract[]) {
  const breakdown: Record<string, number> = {}
  for (const c of contracts) {
    for (const po of c.performanceObligations) {
      const allocated = po.allocatedAmount ?? 0
      breakdown[po.type] = (breakdown[po.type] ?? 0) + allocated
    }
  }
  return Object.entries(breakdown).map(([type, value]) => ({ type, value }))
}
