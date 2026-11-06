import type { ContractStatus } from '../types'

export function StatusBadge({ status }: { status: ContractStatus }) {
  const cls = {
    Active: 'status-active',
    Draft: 'status-draft',
    Modified: 'status-modified',
    Terminated: 'status-terminated',
  }[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
