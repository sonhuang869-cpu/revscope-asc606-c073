import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Contracts } from './pages/Contracts'
import { ContractDetail } from './pages/ContractDetail'
import { NewContract } from './pages/NewContract'
import { Recognition } from './pages/Recognition'
import { Compliance } from './pages/Compliance'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="contracts/new" element={<NewContract />} />
          <Route path="contracts/:id" element={<ContractDetail />} />
          <Route path="recognition" element={<Recognition />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
