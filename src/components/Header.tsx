import { NavLink } from 'react-router-dom'
import { useTheme } from '../theme'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <nav className="flex gap-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `rounded-lg px-3 py-1.5 font-medium ${isActive ? 'bg-secondary' : ''}`
          }
        >
          Home
        </NavLink>
      </nav>
      <button
        onClick={toggleTheme}
        className="rounded-lg border border-border px-4 py-2 font-medium"
      >
        {theme === 'dark' ? 'light' : 'dark'} mode
      </button>
    </header>
  )
}
