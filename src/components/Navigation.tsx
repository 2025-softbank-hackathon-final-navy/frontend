import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation()

  const navItems = [
    { path: '/', label: t('nav.home'), icon: 'fa-home' },
    { path: '/functions', label: t('nav.functions'), icon: 'fa-layer-group' },
    { path: '/nodes', label: 'Nodes', icon: 'fa-server' },
    { path: '/ai-helper', label: t('nav.aiSousChef'), icon: 'fa-robot' },
    { path: '/architecture', label: t('nav.architecture'), icon: 'fa-sitemap' },
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <NavLink to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <i className="fa-solid fa-fire-burner text-amber-600 text-2xl"></i>
            <span className="font-bold text-xl tracking-tight">Code Bistro</span>
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-stone-600">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `hover:text-amber-600 transition-colors flex items-center gap-1.5 ${isActive ? 'text-amber-600 font-semibold' : ''}`
                }
              >
                <i className={`fa-solid ${item.icon} text-xs`}></i>
                {item.label}
              </NavLink>
            ))}
            
            {/* Language Switcher - Desktop */}
            <div className="border-l border-stone-200 pl-4 ml-2">
              <LanguageSwitcher />
            </div>
          </div>
          
          {/* Mobile: Language Switcher + Hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button 
              className="text-stone-600 p-2 hover:bg-stone-100 rounded-lg transition-colors"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-amber-50 text-amber-600' 
                      : 'text-stone-600 hover:bg-stone-50 hover:text-amber-600'
                  }`
                }
              >
                <i className={`fa-solid ${item.icon} w-4`}></i>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
