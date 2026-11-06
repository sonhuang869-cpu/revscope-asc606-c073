export type ContractStatus = 'Draft' | 'Active' | 'Modified' | 'Terminated'
export type POType = 'License' | 'SaaS' | 'Professional Services' | 'Support' | 'Training'
export type BillingSchedule = 'Upfront' | 'Monthly' | 'Milestone'
export type RecognitionMethod = 'Over Time' | 'Point in Time'
export type ModificationType = 'Cumulative Catch-up' | 'Prospective'

export interface PerformanceObligation {
  id: string
  contractId: string
  name: string
  type: POType
  ssp: number
  recognitionMethod: RecognitionMethod
  startDate: string
  endDate: string
  allocatedAmount?: number
  variableConsideration?: {
    estimatedAmount: number
    method: 'Most Likely' | 'Expected Value'
    constrainedAmount: number
  }
}

export interface ContractModification {
  id: string
  date: string
  description: string
  type: ModificationType
  catchUpAmount?: number
}

export interface Contract {
  id: string
  contractNumber: string
  customer: string
  tcv: number
  startDate: string
  endDate: string
  status: ContractStatus
  billingSchedule: BillingSchedule
  performanceObligations: PerformanceObligation[]
  modifications: ContractModification[]
  recognizedToDate: number
  createdAt: string
  updatedAt: string
  notes?: string
}

export interface AuditEntry {
  id: string
  contractId: string
  contractNumber: string
  timestamp: string
  action: string
  details: string
  user: string
  amount?: number
}

export interface RecognitionEntry {
  month: string
  recognized: number
  deferred: number
  byPO: Record<string, number>
}
