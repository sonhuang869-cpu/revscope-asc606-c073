import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <div className="text-6xl num text-white/10 font-bold">404</div>
      <h1 className="text-lg font-semibold text-gray-300">Page Not Found</h1>
      <p className="text-sm text-gray-500">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-2">Go to Dashboard</Link>
    </div>
  )
}
