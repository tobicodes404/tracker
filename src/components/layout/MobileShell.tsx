import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface MobileShellProps {
  children: ReactNode
}

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/library', label: 'Library' },
  { path: '/add', label: 'Add' },
  { path: '/settings', label: 'Settings' },
]

export function MobileShell({ children }: MobileShellProps) {
  const location = useLocation()

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-neutral-900 text-white">
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-neutral-800 border-t border-neutral-700 flex justify-around py-3 safe-area-inset-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center text-xs transition-colors ${
                isActive ? 'text-blue-500' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
