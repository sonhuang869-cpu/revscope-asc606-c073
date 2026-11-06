import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { getContracts } from '../lib/api'
import { StatusBadge } from '../components/StatusBadge'
import type { Contract, ContractStatus } from '../types'
import { format, parseISO } from 'date-fns'

type SortKey = 'contractNumber' | 'customer' | 'tcv' | 'startDate' | 'status' | 'recognizedToDate'
type SortDir = 'asc' | 'desc'

function fmt(n: number) {
  return '$' + Math.round(n).toLocaleString('en-US')
}

const PAGE_SIZE = 8

export function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'All'>('All')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'tcv', dir: 'desc' })
  const [page, setPage] = useState(1)

  useEffect(() => {
    getContracts().then(c => { setContracts(c); setLoading(false) })
  }, [])

  const filtered = contracts
    .filter(c => {
      const q = search.toLowerCase()
      return (
        (statusFilter === 'All' || c.status === statusFilter) &&
        (!q || c.customer.toLowerCase().includes(q) || c.contractNumber.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      const av = a[sort.key]
      const bv = b[sort.key]
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' })
    setPage(1)
  }

  function SortButton({ col }: { col: SortKey }) {
    const active = sort.key === col
    return (
      <button onClick={() => toggleSort(col)} className={`ml-1 ${active ? 'text-[#4F8EF7]' : 'text-gray-600 hover:text-gray-400'}`}>
        <ArrowUpDown size={12} />
      </button>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Contracts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{contracts.length} contracts · {contracts.filter(c => c.status === 'Active').length} active</p>
        </div>
        <Link to="/contracts/new" className="btn-primary flex items-center gap-2">
          <Plus size={14} />
          New Contract
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search contracts or customers…"
            className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#4F8EF7] transition-colors"
          />
        </div>
        <div className="flex gap-1 p-1 bg-[#111827] border border-white/10 rounded-lg">
          {(['All', 'Active', 'Modified', 'Draft', 'Terminated'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-[#1E3A5F] text-[#4F8EF7]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading contracts…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No contracts match your filters.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-white/8 bg-white/2">
                    <th className="text-left px-5 py-3 font-medium">
                      Contract # <SortButton col="contractNumber" />
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Customer <SortButton col="customer" />
                    </th>
                    <th className="text-right px-4 py-3 font-medium">
                      TCV <SortButton col="tcv" />
                    </th>
                    <th className="text-left px-4 py-3 font-medium">
                      Start Date <SortButton col="startDate" />
                    </th>
                    <th className="text-left px-4 py-3 font-medium">End Date</th>
                    <th className="text-right px-4 py-3 font-medium">Recognized</th>
                    <th className="text-left px-4 py-3 font-medium">
                      Status <SortButton col="status" />
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paged.map(c => (
                    <tr key={c.id} className="border-b border-white/5 table-row-hover">
                      <td className="px-5 py-3.5">
                        <Link to={`/contracts/${c.id}`} className="num text-[#4F8EF7] hover:underline font-medium">
                          {c.contractNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-gray-200 font-medium">{c.customer}</td>
                      <td className="px-4 py-3.5 text-right num text-gray-200">{fmt(c.tcv)}</td>
                      <td className="px-4 py-3.5 text-gray-400">{format(parseISO(c.startDate), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3.5 text-gray-400">{format(parseISO(c.endDate), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="num text-gray-300">{fmt(c.recognizedToDate)}</div>
                        <div className="text-[10px] text-gray-600 num">
                          {((c.recognizedToDate / c.tcv) * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={c.status} />
                        {c.modifications.length > 0 && (
                          <div className="text-[10px] text-amber-500 mt-0.5">{c.modifications.length} mod{c.modifications.length > 1 ? 's' : ''}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/contracts/${c.id}`} className="text-xs text-gray-500 hover:text-[#4F8EF7] transition-colors">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-white/8">
                <span className="text-xs text-gray-500">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="num text-xs text-gray-400">{page} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1 rounded text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
