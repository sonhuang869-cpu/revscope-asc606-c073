import type { Contract, AuditEntry } from '../types'
import { SEED_CONTRACTS, SEED_AUDIT_LOG } from '../data/seed'

const STORAGE_KEY = 'revscope_contracts'
const AUDIT_KEY = 'revscope_audit'

function loadContracts(): Contract[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Contract[]
  } catch {}
  return SEED_CONTRACTS
}

function saveContracts(contracts: Contract[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts))
  } catch {}
}

function loadAudit(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY)
    if (raw) return JSON.parse(raw) as AuditEntry[]
  } catch {}
  return SEED_AUDIT_LOG
}

function saveAudit(entries: AuditEntry[]) {
  try {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(entries))
  } catch {}
}

function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getContracts(): Promise<Contract[]> {
  await delay()
  return loadContracts()
}

export async function getContract(id: string): Promise<Contract | null> {
  await delay(200)
  return loadContracts().find(c => c.id === id) ?? null
}

export async function createContract(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
  await delay(400)
  const contracts = loadContracts()
  const newContract: Contract = {
    ...data,
    id: `c${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  contracts.push(newContract)
  saveContracts(contracts)

  const audit = loadAudit()
  audit.unshift({
    id: `a${Date.now()}`,
    contractId: newContract.id,
    contractNumber: newContract.contractNumber,
    timestamp: new Date().toISOString(),
    action: 'Contract Created',
    details: `New contract created for ${newContract.customer}`,
    user: 'H. Randhawa',
  })
  saveAudit(audit)

  return newContract
}

export async function updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
  await delay(300)
  const contracts = loadContracts()
  const idx = contracts.findIndex(c => c.id === id)
  if (idx === -1) throw new Error('Contract not found')

  const updated = { ...contracts[idx], ...updates, updatedAt: new Date().toISOString() }
  contracts[idx] = updated
  saveContracts(contracts)

  const audit = loadAudit()
  audit.unshift({
    id: `a${Date.now()}`,
    contractId: id,
    contractNumber: updated.contractNumber,
    timestamp: new Date().toISOString(),
    action: 'Contract Updated',
    details: `Contract updated — ${Object.keys(updates).join(', ')} changed`,
    user: 'H. Randhawa',
  })
  saveAudit(audit)

  return updated
}

export async function getAuditLog(): Promise<AuditEntry[]> {
  await delay(200)
  return loadAudit()
}

export async function resetDemoData(): Promise<void> {
  await delay(200)
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(AUDIT_KEY)
  } catch {}
}
